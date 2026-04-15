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
  int _currentPhotoIndex = 0; 
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

    // Move to next card visually immediately and reset photo index
    setState(() {
      _currentIndex++;
      _currentPhotoIndex = 0; 
    });

    try {
      final result = await ApiService.sendInteraction(
        toUserId: targetUserId, 
        type: isLike ? 'like' : 'pass'
      );

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

  // Safely format the image URL
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
              const Text("Check back later for more profiles.", style: TextStyle(color: Colors.grey)),
            ],
          ),
        ),
      );
    }

    final profile = _profiles[_currentIndex];
    final basicInfo = profile['basicInfo'] ?? {};
    final profileData = profile['profile'] ?? {};
    final List<dynamic> photos = profileData['photos'] ?? [];

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
                      // 1. Base Image Layer (Absolute Bottom)
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

                      // 2. Bottom Shadow Gradient wrapped in IgnorePointer
                      // This ensures the gradient is purely visual and never steals taps!
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
                                Text(
                                  basicInfo['gender'] ?? '',
                                  style: const TextStyle(color: Colors.white70, fontSize: 16),
                                ),
                              ],
                            ),
                            const SizedBox(height: 5),
                            Text(
                              profileData['bio'] ?? '',
                              style: const TextStyle(color: Colors.white, fontSize: 16),
                              maxLines: 3, overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 5),
                            ... (profileData['promptAnswers'] as List<dynamic>? ?? []).map((prompt) {
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
                            }).toList(),
                          ],
                        ),
                      ),

                      // 4. Photo Indicators (Bars at the top)
                      if (photos.length > 1)
                        Positioned(
                          top: 10,
                          left: 10,
                          right: 10,
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

                      // 5. Left Scroll Button (Absolute Top Layer)
                      if (_currentPhotoIndex > 0)
                        Positioned(
                          left: 10,
                          top: 0,
                          bottom: 0,
                          child: Center(
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.4), // Slightly darker for better contrast
                                shape: BoxShape.circle,
                              ),
                              child: IconButton(
                                icon: const Icon(Icons.chevron_left, color: Colors.white, size: 36),
                                onPressed: () {
                                  setState(() {
                                    _currentPhotoIndex--;
                                  });
                                },
                              ),
                            ),
                          ),
                        ),

                      // 6. Right Scroll Button (Absolute Top Layer)
                      if (_currentPhotoIndex < photos.length - 1)
                        Positioned(
                          right: 10,
                          top: 0,
                          bottom: 0,
                          child: Center(
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.4),
                                shape: BoxShape.circle,
                              ),
                              child: IconButton(
                                icon: const Icon(Icons.chevron_right, color: Colors.white, size: 36),
                                onPressed: () {
                                  setState(() {
                                    _currentPhotoIndex++;
                                  });
                                },
                              ),
                            ),
                          ),
                        ),

                    ],
                  ),
                ),
              ),
            ),

            // Interaction Buttons (Like / Pass)
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