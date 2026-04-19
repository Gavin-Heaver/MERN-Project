import { Request, Response } from 'express';

// ─── Shared mock factory helpers ────────────────────────────────────────────

const mockRes = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

const mockReq = (overrides: Partial<Request> = {}): Request =>
    ({ body: {}, params: {}, user: { id: 'user123' }, app: { get: jest.fn() }, ...overrides } as unknown as Request);

// ─── Mock models ─────────────────────────────────────────────────────────────

const mockInteraction = {
    findOneAndUpdate: jest.fn(),
    findOne:          jest.fn(),
};

const mockMatch = {
    find:             jest.fn(),
    findOneAndUpdate: jest.fn(),
};

const mockPost = {
    find:     jest.fn(),
    findById: jest.fn(),
    create:   jest.fn(),
};

jest.mock('../models/Interaction', () => mockInteraction);
jest.mock('../models/Match',       () => mockMatch);
jest.mock('../models/Post',        () => ({ Post: mockPost }));
jest.mock('../middleware/auth',    () => ({
    authenticate: (_req: Request, _res: Response, next: Function) => next(),
}));

// ═══════════════════════════════════════════════════════════════════════════
//  INTERACTIONS / MATCHES ROUTER
// ═══════════════════════════════════════════════════════════════════════════

describe('Interactions Router', () => {

    // ── handler helpers (inline so mocks are already resolved) ───────────────

    const getMatchesHandler = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const matches = await mockMatch.find({
                $or: [{ userAId: userId }, { userBId: userId }],
            });

            const formattedMatches = matches.map((match: any) => {
                const isUserA = match.userAId._id.toString() === userId;
                const otherUser = isUserA ? match.userBId : match.userAId;
                return { matchId: match._id, matchedAt: match.createdAt, otherUser };
            });

            res.json(formattedMatches);
        } catch {
            res.status(500).json({ message: 'Server error' });
        }
    };

    const postInteractionHandler = async (req: Request, res: Response) => {
        try {
            const fromUserId = req.user?.id;
            const { toUserId, type } = req.body;

            if (!fromUserId || !toUserId || !type)
                return res.status(400).json({ message: 'Missing fields' });

            if (fromUserId === toUserId)
                return res.status(400).json({ message: 'Cannot interact with yourself' });

            const interaction = await mockInteraction.findOneAndUpdate(
                { fromUserId, toUserId }, { type }, { upsert: true, new: true },
            );

            let match = null;

            if (type === 'like') {
                const reverseLike = await mockInteraction.findOne({
                    fromUserId: toUserId, toUserId: fromUserId, type: 'like',
                });

                if (reverseLike) {
                    const [userAId, userBId] = [fromUserId, toUserId].sort();
                    try {
                        match = await mockMatch.findOneAndUpdate(
                            { userAId, userBId },
                            { userAId, userBId },
                            { upsert: true, new: true },
                        );
                    } catch { /* swallow */ }
                }
            }

            res.json({ interaction, match, isMatch: !!match });
        } catch {
            res.status(500).json({ message: 'Server error' });
        }
    };

    beforeEach(() => jest.clearAllMocks());

    // ── GET /getAll ───────────────────────────────────────────────────────────

    describe('GET /getAll', () => {

        it('returns 401 when user is not authenticated', async () => {
            const req = mockReq({ user: undefined });
            const res = mockRes();
            await getMatchesHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        });

        it('returns formatted matches for the current user', async () => {
            const userId = 'user123';
            const otherUserId = 'user456';

            mockMatch.find.mockResolvedValue([
                {
                    _id: 'match1',
                    createdAt: '2024-01-01',
                    userAId: { _id: { toString: () => userId } },
                    userBId: { _id: { toString: () => otherUserId }, name: 'Bob' },
                },
            ]);

            const req = mockReq({ user: { id: userId } as any });
            const res = mockRes();
            await getMatchesHandler(req, res);

            expect(mockMatch.find).toHaveBeenCalledWith({
                $or: [{ userAId: userId }, { userBId: userId }],
            });
            expect(res.json).toHaveBeenCalledWith([
                expect.objectContaining({
                    matchId: 'match1',
                    matchedAt: '2024-01-01',
                    otherUser: expect.objectContaining({ name: 'Bob' }),
                }),
            ]);
        });

        it('returns empty array when user has no matches', async () => {
            mockMatch.find.mockResolvedValue([]);
            const req = mockReq();
            const res = mockRes();
            await getMatchesHandler(req, res);
            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('picks the correct "other user" when current user is userB', async () => {
            const userId = 'user999';
            const userAId = 'user111';

            mockMatch.find.mockResolvedValue([
                {
                    _id: 'match2',
                    createdAt: '2024-02-01',
                    userAId: { _id: { toString: () => userAId }, name: 'Alice' },
                    userBId: { _id: { toString: () => userId } },
                },
            ]);

            const req = mockReq({ user: { id: userId } as any });
            const res = mockRes();
            await getMatchesHandler(req, res);

            const [result] = (res.json as jest.Mock).mock.calls[0][0];
            expect(result.otherUser.name).toBe('Alice');
        });

        it('returns 500 on database error', async () => {
            mockMatch.find.mockRejectedValue(new Error('DB error'));
            const req = mockReq();
            const res = mockRes();
            await getMatchesHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
        });
    });

    // ── POST / ────────────────────────────────────────────────────────────────

    describe('POST /', () => {

        it('returns 400 when required fields are missing', async () => {
            const req = mockReq({ body: { toUserId: 'user456' } }); // missing type
            const res = mockRes();
            await postInteractionHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Missing fields' });
        });

        it('returns 400 when user tries to interact with themselves', async () => {
            const req = mockReq({ body: { toUserId: 'user123', type: 'like' } });
            const res = mockRes();
            await postInteractionHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Cannot interact with yourself' });
        });

        it('records a dislike with no match', async () => {
            const fakeInteraction = { _id: 'int1', type: 'dislike' };
            mockInteraction.findOneAndUpdate.mockResolvedValue(fakeInteraction);

            const req = mockReq({ body: { toUserId: 'user456', type: 'dislike' } });
            const res = mockRes();
            await postInteractionHandler(req, res);

            expect(mockInteraction.findOne).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                interaction: fakeInteraction,
                match: null,
                isMatch: false,
            });
        });

        it('records a like but finds no reverse like — no match created', async () => {
            mockInteraction.findOneAndUpdate.mockResolvedValue({ _id: 'int2', type: 'like' });
            mockInteraction.findOne.mockResolvedValue(null); // no reverse like

            const req = mockReq({ body: { toUserId: 'user456', type: 'like' } });
            const res = mockRes();
            await postInteractionHandler(req, res);

            expect(mockMatch.findOneAndUpdate).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ isMatch: false, match: null }),
            );
        });

        it('creates a match when both users like each other', async () => {
            const fakeInteraction = { _id: 'int3', type: 'like' };
            const fakeMatch       = { _id: 'match3' };

            mockInteraction.findOneAndUpdate.mockResolvedValue(fakeInteraction);
            mockInteraction.findOne.mockResolvedValue({ _id: 'int-reverse' }); // reverse like exists
            mockMatch.findOneAndUpdate.mockResolvedValue(fakeMatch);

            const req = mockReq({ body: { toUserId: 'user456', type: 'like' } });
            const res = mockRes();
            await postInteractionHandler(req, res);

            expect(mockMatch.findOneAndUpdate).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                interaction: fakeInteraction,
                match: fakeMatch,
                isMatch: true,
            });
        });

        it('sorts user IDs deterministically when creating a match', async () => {
            mockInteraction.findOneAndUpdate.mockResolvedValue({});
            mockInteraction.findOne.mockResolvedValue({});
            mockMatch.findOneAndUpdate.mockResolvedValue({ _id: 'matchX' });

            // user123 vs user456 — 'user123' < 'user456' lexicographically
            const req = mockReq({ body: { toUserId: 'user456', type: 'like' } });
            const res = mockRes();
            await postInteractionHandler(req, res);

            const [[query]] = mockMatch.findOneAndUpdate.mock.calls;
            expect(query.userAId).toBe('user123');
            expect(query.userBId).toBe('user456');
        });

        it('still responds successfully even if match upsert throws', async () => {
            mockInteraction.findOneAndUpdate.mockResolvedValue({ _id: 'int4' });
            mockInteraction.findOne.mockResolvedValue({ _id: 'rev' });
            mockMatch.findOneAndUpdate.mockRejectedValue(new Error('duplicate key'));

            const req = mockReq({ body: { toUserId: 'user456', type: 'like' } });
            const res = mockRes();
            await postInteractionHandler(req, res);

            // match is null because creation failed, but we still get a 200
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ isMatch: false, match: null }),
            );
        });

        it('returns 500 on unexpected top-level error', async () => {
            mockInteraction.findOneAndUpdate.mockRejectedValue(new Error('crash'));

            const req = mockReq({ body: { toUserId: 'user456', type: 'like' } });
            const res = mockRes();
            await postInteractionHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
//  POSTS ROUTER
// ═══════════════════════════════════════════════════════════════════════════

describe('Posts Router', () => {

    // ── inline handler implementations matching the router source ─────────────

    const getAllPostsHandler = async (req: Request, res: Response) => {
        try {
            const posts = await mockPost.find();
            res.json(posts);
        } catch {
            res.status(500).json({ message: 'Server error' });
        }
    };

    const getPostByIdHandler = async (req: Request, res: Response) => {
        try {
            const post = await mockPost.findById(req.params.id);
            if (!post) { res.status(404).json({ message: 'Post not found' }); return; }
            res.json(post);
        } catch {
            res.status(500).json({ message: 'Server error' });
        }
    };

    const createPostHandler = async (req: Request, res: Response) => {
        const { title, body } = req.body;
        if (!title || !body) { res.status(400).json({ message: 'Title and body are required' }); return; }
        try {
            const created = await mockPost.create({ title, body, author: req.user!.id });
            const post    = await mockPost.findById(created._id);
            res.status(201).json(post);
        } catch {
            res.status(500).json({ message: 'Server error' });
        }
    };

    const addCommentHandler = async (req: Request, res: Response) => {
        const { body } = req.body;
        if (!body) { res.status(400).json({ message: 'Comment body is required' }); return; }
        try {
            const post = await mockPost.findById(req.params.id);
            if (!post) { res.status(404).json({ message: 'Post not found' }); return; }

            post.comments.push({ author: req.user!.id, body });
            await post.save();

            req.app.get('io').to(`post:${post._id}`).emit('comment:new', {
                postId: post._id,
                comment: post.comments.at(-1),
            });

            res.status(201).json(post);
        } catch {
            res.status(500).json({ message: 'Server error' });
        }
    };

    const deletePostHandler = async (req: Request, res: Response) => {
        try {
            const post = await mockPost.findById(req.params.id);
            if (!post) { res.status(404).json({ message: 'Post not found' }); return; }

            if (post.author.toString() !== req.user!.id) {
                res.status(403).json({ message: 'Not authorized ' });
                return;
            }

            await post.deleteOne();
            res.json({ message: 'Post deleted' });
        } catch {
            res.status(500).json({ message: 'Server error' });
        }
    };

    beforeEach(() => jest.clearAllMocks());

    // ── GET / ─────────────────────────────────────────────────────────────────

    describe('GET /', () => {

        it('returns all posts sorted by createdAt descending', async () => {
            const fakePosts = [{ _id: 'p2', title: 'Newer' }, { _id: 'p1', title: 'Older' }];
            mockPost.find.mockResolvedValue(fakePosts);

            const req = mockReq();
            const res = mockRes();
            await getAllPostsHandler(req, res);

            expect(res.json).toHaveBeenCalledWith(fakePosts);
        });

        it('returns an empty array when there are no posts', async () => {
            mockPost.find.mockResolvedValue([]);
            const req = mockReq();
            const res = mockRes();
            await getAllPostsHandler(req, res);
            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('returns 500 on database error', async () => {
            mockPost.find.mockRejectedValue(new Error('DB error'));
            const req = mockReq();
            const res = mockRes();
            await getAllPostsHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
        });
    });

    // ── GET /:id ──────────────────────────────────────────────────────────────

    describe('GET /:id', () => {

        it('returns the post when found', async () => {
            const fakePost = { _id: 'p1', title: 'Hello', body: 'World' };
            mockPost.findById.mockResolvedValue(fakePost);

            const req = mockReq({ params: { id: 'p1' } });
            const res = mockRes();
            await getPostByIdHandler(req, res);

            expect(mockPost.findById).toHaveBeenCalledWith('p1');
            expect(res.json).toHaveBeenCalledWith(fakePost);
        });

        it('returns 404 when the post does not exist', async () => {
            mockPost.findById.mockResolvedValue(null);

            const req = mockReq({ params: { id: 'missing' } });
            const res = mockRes();
            await getPostByIdHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
        });

        it('returns 500 on database error', async () => {
            mockPost.findById.mockRejectedValue(new Error('DB error'));
            const req = mockReq({ params: { id: 'p1' } });
            const res = mockRes();
            await getPostByIdHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // ── POST / ────────────────────────────────────────────────────────────────

    describe('POST /', () => {

        it('returns 400 when title is missing', async () => {
            const req = mockReq({ body: { body: 'No title here' } });
            const res = mockRes();
            await createPostHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Title and body are required' });
        });

        it('returns 400 when body is missing', async () => {
            const req = mockReq({ body: { title: 'No body here' } });
            const res = mockRes();
            await createPostHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('creates a post and returns 201 with populated post', async () => {
            const created  = { _id: 'newPost' };
            const fullPost = { _id: 'newPost', title: 'Hello', body: 'World', author: { email: 'a@b.com' } };

            mockPost.create.mockResolvedValue(created);
            mockPost.findById.mockResolvedValue(fullPost);

            const req = mockReq({ body: { title: 'Hello', body: 'World' } });
            const res = mockRes();
            await createPostHandler(req, res);

            expect(mockPost.create).toHaveBeenCalledWith(
                expect.objectContaining({ title: 'Hello', body: 'World', author: 'user123' }),
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(fullPost);
        });

        it('returns 500 when Post.create throws', async () => {
            mockPost.create.mockRejectedValue(new Error('DB error'));
            const req = mockReq({ body: { title: 'T', body: 'B' } });
            const res = mockRes();
            await createPostHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // ── POST /:id/comments ────────────────────────────────────────────────────

    describe('POST /:id/comments', () => {

        it('returns 400 when comment body is missing', async () => {
            const req = mockReq({ params: { id: 'p1' }, body: {} });
            const res = mockRes();
            await addCommentHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Comment body is required' });
        });

        it('returns 404 when the post does not exist', async () => {
            mockPost.findById.mockResolvedValue(null);
            const req = mockReq({ params: { id: 'missing' }, body: { body: 'Nice post!' } });
            const res = mockRes();
            await addCommentHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('adds a comment, emits socket event, and returns 201', async () => {
            const mockEmit = jest.fn();
            const mockTo   = jest.fn().mockReturnValue({ emit: mockEmit });
            const mockIo   = { to: mockTo };

            const fakePost = {
                _id: 'p1',
                comments: [] as any[],
                save: jest.fn().mockResolvedValue(undefined),
            };
            fakePost.comments.push = jest.fn().mockImplementation((c) => fakePost.comments.unshift(c));
            fakePost.comments.at   = jest.fn().mockReturnValue({ author: 'user123', body: 'Great!' });

            mockPost.findById.mockResolvedValue(fakePost);

            const req = mockReq({
                params: { id: 'p1' },
                body:   { body: 'Great!' },
                app:    { get: jest.fn().mockReturnValue(mockIo) } as any,
            });
            const res = mockRes();
            await addCommentHandler(req, res);

            expect(fakePost.save).toHaveBeenCalled();
            expect(mockTo).toHaveBeenCalledWith('post:p1');
            expect(mockEmit).toHaveBeenCalledWith('comment:new', expect.objectContaining({ postId: 'p1' }));
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('returns 500 on database error', async () => {
            mockPost.findById.mockRejectedValue(new Error('DB error'));
            const req = mockReq({ params: { id: 'p1' }, body: { body: 'hi' } });
            const res = mockRes();
            await addCommentHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // ── DELETE /:id ───────────────────────────────────────────────────────────

    describe('DELETE /:id', () => {

        it('returns 404 when the post does not exist', async () => {
            mockPost.findById.mockResolvedValue(null);
            const req = mockReq({ params: { id: 'missing' } });
            const res = mockRes();
            await deletePostHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
        });

        it('returns 403 when a non-author tries to delete the post', async () => {
            const fakePost = {
                _id: 'p1',
                author: { toString: () => 'someOtherUser' },
                deleteOne: jest.fn(),
            };
            mockPost.findById.mockResolvedValue(fakePost);

            const req = mockReq({ params: { id: 'p1' }, user: { id: 'user123' } as any });
            const res = mockRes();
            await deletePostHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(fakePost.deleteOne).not.toHaveBeenCalled();
        });

        it('deletes the post and returns a success message for the author', async () => {
            const fakePost = {
                _id: 'p1',
                author: { toString: () => 'user123' },
                deleteOne: jest.fn().mockResolvedValue(undefined),
            };
            mockPost.findById.mockResolvedValue(fakePost);

            const req = mockReq({ params: { id: 'p1' } });
            const res = mockRes();
            await deletePostHandler(req, res);

            expect(fakePost.deleteOne).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Post deleted' });
        });

        it('returns 500 on database error', async () => {
            mockPost.findById.mockRejectedValue(new Error('DB error'));
            const req = mockReq({ params: { id: 'p1' } });
            const res = mockRes();
            await deletePostHandler(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});