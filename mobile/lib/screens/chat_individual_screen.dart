import 'package:flutter/material.dart';
import 'dart:async'; 
import '../services/api_service.dart';

class ChatScreen extends StatefulWidget {
  final String chatName; 
  final String conversationId;
  final String otherUserId;
  final String myUserId;
  final String? photoUrl; 
  final String matchId; // NEW: Required for unmatching

  const ChatScreen({
    super.key, 
    required this.chatName, 
    required this.conversationId, 
    required this.otherUserId,
    required this.myUserId,
    this.photoUrl, 
    required this.matchId, // NEW
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  List<dynamic> _messages = [];
  bool _isLoading = true;
  Timer? _refreshTimer; 

  @override
  void initState() {
    super.initState();
    _fetchMessages();
    _refreshTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      _fetchMessages(isAutoRefresh: true);
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel(); 
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchMessages({bool isAutoRefresh = false}) async {
    try {
      final messages = await ApiService.getMessages(widget.conversationId);
      if (!mounted) return;
      
      if (messages.length != _messages.length) {
        if (mounted) {
          setState(() {
            _messages = messages;
            _isLoading = false;
          });
          _scrollToBottom();
        }
      } else if (!isAutoRefresh) {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      print("Error loading messages: $e");
      if (!isAutoRefresh) setState(() => _isLoading = false);
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    final temporaryMessage = {
      'text': text,
      'senderId': widget.myUserId,
      'createdAt': DateTime.now().toIso8601String(),
    };

    setState(() {
      _messages.add(temporaryMessage);
    });

    _messageController.clear();
    _scrollToBottom();

    try {
      await ApiService.sendMessage(toUserId: widget.otherUserId, text: text);
      _fetchMessages(isAutoRefresh: true);
    } catch (e) {
      print("Error sending message: $e");
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300), 
          curve: Curves.easeOut, 
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    const Color crimson = Color.fromARGB(255, 170, 57, 71);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1, 
        iconTheme: const IconThemeData(color: crimson),
        title: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () {
            // NEW: Push to the Profile Screen when tapped
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ChatProfileScreen(
                  userId: widget.otherUserId,
                  matchId: widget.matchId,
                ),
              ),
            ).then((unmatched) {
              // If they unmatched, immediately pop back to the messages list
              if (unmatched == true && mounted) {
                Navigator.pop(context); 
              }
            });
          },
          child: Row( 
            children: [
              CircleAvatar( 
                radius: 18,
                backgroundColor: Colors.grey[200],
                backgroundImage: widget.photoUrl != null 
                    ? NetworkImage(widget.photoUrl!) 
                    : null,
                child: widget.photoUrl == null 
                    ? const Icon(Icons.person, color: Colors.grey, size: 20) 
                    : null,
              ),
              const SizedBox(width: 12), 
              Expanded(
                child: Text(
                  widget.chatName, 
                  style: const TextStyle(color: Colors.black87, fontSize: 18),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator(color: crimson))
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    final message = _messages[index];
                    final isMe = message['senderId'] == widget.myUserId;

                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: isMe ? crimson : Colors.grey[200],
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Text(
                          message['text'] ?? '',
                          style: TextStyle(color: isMe ? Colors.white : Colors.black87),
                        ),
                      ),
                    );
                  },
                ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      filled: true,
                      fillColor: Colors.grey[100],
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(25), borderSide: BorderSide.none),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: crimson),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// =========================================================================
// NEW: Chat Profile Screen (Shows the feed-style card + Unmatch/Close buttons)
// =========================================================================
class ChatProfileScreen extends StatefulWidget {
  final String userId;
  final String matchId;

  const ChatProfileScreen({super.key, required this.userId, required this.matchId});

  @override
  State<ChatProfileScreen> createState() => _ChatProfileScreenState();
}

class _ChatProfileScreenState extends State<ChatProfileScreen> {
  Map<String, dynamic>? _user;
  bool _isLoading = true;
  int _currentPhotoIndex = 0;

  @override
  void initState() {
    super.initState();
    _fetchUser();
  }

  Future<void> _fetchUser() async {
    try {
      final userData = await ApiService.getUserById(widget.userId);

      if (!mounted) return;

      setState(() {
        _user = userData;
        _isLoading = false;
      });
    } catch (e) {
      print(e);
      setState(() => _isLoading = false);
    }
  }

void _unmatch() {
    showDialog(
      context: context,
      // THE FIX: Rename the inner context to 'dialogContext' so it doesn't shadow the main screen's context
      builder: (BuildContext dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text("Unmatch User?"),
        content: const Text("Are you sure you want to unmatch? This will delete your chat history and you won't see them again."),
        actions: [
          // Close the dialog using dialogContext
          TextButton(
            onPressed: () => Navigator.pop(dialogContext), 
            child: const Text("Cancel")
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () async {
              // 1. Close the dialog using dialogContext
              Navigator.pop(dialogContext); 
              
              setState(() => _isLoading = true);
              try {
                // 2. Wait for the API
                await ApiService.unmatchUser(widget.matchId);
                
                // 3. Pop the entire Profile Screen using the OUTER context!
                if (mounted) {
                  Navigator.pop(context, true); 
                }
              } catch (e) {
                setState(() => _isLoading = false);
                // Also use the OUTER context for the error snackbar
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
              }
            },
            child: const Text("Unmatch", style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  String _getPhotoUrl(String? rawUrl) {
    if (rawUrl == null || rawUrl.isEmpty) return '';
    if (rawUrl.startsWith('http')) return rawUrl;
    return 'https://uknighted.onrender.com$rawUrl';
  }

  @override
  Widget build(BuildContext context) {
    const Color crimson = Color.fromARGB(255, 170, 57, 71);

    if (_isLoading) {
      return const Scaffold(backgroundColor: Colors.white, body: Center(child: CircularProgressIndicator(color: crimson)));
    }

    if (_user == null) {
      return const Scaffold(backgroundColor: Colors.white, body: Center(child: Text("Could not load profile.")));
    }

    final basicInfo = _user!['basicInfo'] ?? {};
    final profileData = _user!['profile'] ?? {};
    final List<dynamic> photos = profileData['photos'] ?? [];
    final List<dynamic> promptAnswers = profileData['promptAnswers'] ?? [];

    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // 1. Base Image Layer
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.blueGrey, 
                          image: photos.isNotEmpty
                              ? DecorationImage(
                                  image: NetworkImage(_getPhotoUrl(photos[_currentPhotoIndex]['url'])),
                                  fit: BoxFit.cover,
                                )
                              : null,
                        ),
                        child: photos.isEmpty ? const Icon(Icons.person, size: 150, color: Colors.white30) : null,
                      ),

                      // 2. Bottom Shadow Gradient
                      const IgnorePointer(
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter, end: Alignment.bottomCenter,
                              colors: [Colors.transparent, Colors.black87], stops: [0.6, 1.0], 
                            ),
                          ),
                        ),
                      ),

                      // 3. User Info Text Layer
                      Positioned(
                        bottom: 20, left: 20, right: 20,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.baseline,
                              textBaseline: TextBaseline.alphabetic,
                              children: [
                                Text(
                                  basicInfo['firstName'] ?? 'Unknown',
                                  style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  basicInfo['age']?.toString() ?? '',
                                  style: const TextStyle(color: Colors.white, fontSize: 24),
                                ),
                              ],
                            ),
                            const SizedBox(height: 5),
                            Row(
                              children: [
                                const Icon(Icons.info_outline, color: Colors.white70, size: 16),
                                const SizedBox(width: 5),
                                Text(
                                  basicInfo['gender'] ?? '',
                                  style: const TextStyle(color: Colors.white70, fontSize: 16),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              profileData['bio'] ?? '',
                              style: const TextStyle(color: Colors.white, fontSize: 16),
                              maxLines: 3, overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 10),
                            // Render Prompts
                            ...promptAnswers.map((prompt) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 4.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      prompt['question'] ?? '',
                                      style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                                    ),
                                    Text(
                                      prompt['answer'] ?? '',
                                      style: const TextStyle(color: Colors.white, fontSize: 13, fontStyle: FontStyle.italic),
                                    ),
                                  ],
                                ),
                              );
                            }),
                          ],
                        ),
                      ),

                      // 4. Photo Indicators
                      if (photos.length > 1)
                        Positioned(
                          top: 10, left: 10, right: 10,
                          child: Row(
                            children: List.generate(
                              photos.length,
                              (index) => Expanded(
                                child: Container(
                                  margin: const EdgeInsets.symmetric(horizontal: 2),
                                  height: 4,
                                  decoration: BoxDecoration(
                                    color: _currentPhotoIndex == index ? Colors.white : Colors.white.withOpacity(0.4),
                                    borderRadius: BorderRadius.circular(2),
                                    boxShadow: [
                                      BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 2, offset: const Offset(0, 1))
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),

                      // 5. Left Scroll
                      if (_currentPhotoIndex > 0)
                        Positioned(
                          left: 10, top: 0, bottom: 0,
                          child: Center(
                            child: Container(
                              decoration: BoxDecoration(color: Colors.black.withOpacity(0.4), shape: BoxShape.circle),
                              child: IconButton(
                                icon: const Icon(Icons.chevron_left, color: Colors.white, size: 36),
                                onPressed: () => setState(() => _currentPhotoIndex--),
                              ),
                            ),
                          ),
                        ),

                      // 6. Right Scroll
                      if (_currentPhotoIndex < photos.length - 1)
                        Positioned(
                          right: 10, top: 0, bottom: 0,
                          child: Center(
                            child: Container(
                              decoration: BoxDecoration(color: Colors.black.withOpacity(0.4), shape: BoxShape.circle),
                              child: IconButton(
                                icon: const Icon(Icons.chevron_right, color: Colors.white, size: 36),
                                onPressed: () => setState(() => _currentPhotoIndex++),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),

            // Action Buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
              child: Column(
                children: [
                  ElevatedButton(
                    onPressed: _unmatch,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent,
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                    ),
                    child: const Text("Unmatch", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                  const SizedBox(height: 10),
                  TextButton(
                    onPressed: () => Navigator.pop(context), // Just closes the profile view
                    style: TextButton.styleFrom(
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                    ),
                    child: const Text("Close", style: TextStyle(fontSize: 16, color: Colors.grey, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}