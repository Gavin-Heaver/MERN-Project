import 'package:flutter/material.dart';
import '../services/api_service.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  List<dynamic> _profiles = [];
  int _currentIndex = 0;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  Future<void> _fetchUsers() async {
    try {
      final users = await ApiService.getDiscoverUsers();
      setState(() {
        _profiles = users;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _handleSwipe(bool isLike) async {
    if (_currentIndex >= _profiles.length) return;

    final currentProfile = _profiles[_currentIndex];
    final targetUserId = currentProfile['_id'];

    // Move to next card visually immediately
    setState(() {
      _currentIndex++;
    });

    try {
      // Tell the backend!
      final result = await ApiService.sendInteraction(
        toUserId: targetUserId, 
        type: isLike ? 'like' : 'pass'
      );

      // Check if the backend reported a match!
      if (isLike && result['matched'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text("🎉 It's a Match with ${currentProfile['basicInfo']['firstName']}!"),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 3),
            ),
          );
        }
      }
    } catch (e) {
      print("Swipe Error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(backgroundColor: Colors.white, body: Center(child: CircularProgressIndicator()));
    }

    if (_error != null) {
      return Scaffold(backgroundColor: Colors.white, body: Center(child: Text(_error!)));
    }

    if (_currentIndex >= _profiles.length) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset('assets/Logo_V2.png', height: 100, width: 100),
              const SizedBox(height: 20),
              const Text("You're all caught up!", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const Text("Check back later for more UKnighted profiles.", style: TextStyle(color: Colors.grey)),
            ],
          ),
        ),
      );
    }

    final profile = _profiles[_currentIndex];
    final basicInfo = profile['basicInfo'] ?? {};
    final profileData = profile['profile'] ?? {};

    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset('assets/Logo_V2.png', height: 36, width: 36, fit: BoxFit.contain),
                  const SizedBox(width: 8),
                  const Text('Uknighted', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87)),
                ],
              ),
            ),

            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Container(
                        color: Colors.blueGrey, // Placeholder color until photos are linked
                        child: const Icon(Icons.person, size: 150, color: Colors.white30),
                      ),
                      const DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter, end: Alignment.bottomCenter,
                            colors: [Colors.transparent, Colors.black87], stops: [0.6, 1.0], 
                          ),
                        ),
                      ),
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
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  FloatingActionButton(
                    heroTag: 'passBtn', 
                    onPressed: () => _handleSwipe(false),
                    backgroundColor: Colors.white, elevation: 5,
                    child: const Icon(Icons.close_rounded, color: Colors.redAccent, size: 35),
                  ),
                  FloatingActionButton(
                    heroTag: 'likeBtn',
                    onPressed: () => _handleSwipe(true),
                    backgroundColor: Colors.white, elevation: 5,
                    child: const Icon(Icons.favorite_rounded, color: Colors.green, size: 35),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }
}