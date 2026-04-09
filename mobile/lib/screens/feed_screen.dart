//imports
import 'package:flutter/material.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  // Mock Database of Profiles
  final List<Map<String, dynamic>> _profiles = [
    {
      'id': '101',
      'name': 'Taylor',
      'age': 21,
      'gender': 'Female',
      'bio': 'CS major. Catch me at the library or getting coffee. ☕️',
      'color': Colors.blueGrey, 
    },
    {
      'id': '102',
      'name': 'Jordan',
      'age': 22,
      'gender': 'Male',
      'bio': 'Always down for a late night coding session or a movie marathon.',
      'color': Colors.teal,
    },
    {
      'id': '103',
      'name': 'Casey',
      'age': 20,
      'gender': 'Non-binary',
      'bio': 'Robotics nerd. I built a robot that can fetch me snacks.',
      'color': Colors.deepPurple,
    },
  ];

  int _currentIndex = 0;

  void _handleSwipe(bool isLike) {
    if (_currentIndex >= _profiles.length) return;

    final currentProfile = _profiles[_currentIndex];

    // TODO: Send API request to Express/MongoDB
    if (isLike) {
      print("You LIKED ${currentProfile['name']}. Triggering notification check...");
      
    } else {
      print("You PASSED on ${currentProfile['name']}.");
    }

    // Move to the next profile
    setState(() {
      _currentIndex++;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_currentIndex >= _profiles.length) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo
              Image.asset('assets/Logo_V2.png', height: 100, width: 100),
              SizedBox(height: 20),
              Text(
                "You're all caught up!",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              Text(
                "Check back later for more UKnighted profiles.",
                style: TextStyle(color: Colors.grey),
              ),
            ],
          ),
        ),
      );
    }

    final profile = _profiles[_currentIndex];

    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo with name
                  Image.asset('assets/Logo_V2.png', height: 36, width: 36, fit: BoxFit.contain),
                  SizedBox(width: 8),
                  Text(
                    'Uknighted',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
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
                        color: profile['color'],
                        child: const Icon(Icons.person, size: 150, color: Colors.white30),
                        // LATER: Replace the Container with this:
                        // Image.network(profile['imageUrl'], fit: BoxFit.cover),
                      ),

                      const DecoratedBox(
                        //Shape and color of box
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black87,
                            ],
                            stops: [0.6, 1.0], 
                          ),
                        ),
                      ),

                      // Name, age, gender, bio location and characteristics
                      Positioned(
                        bottom: 20,
                        left: 20,
                        right: 20,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.baseline,
                              textBaseline: TextBaseline.alphabetic,
                              children: [
                                Text(
                                  profile['name'],
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  profile['age'].toString(),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 5),
                            Row(
                              children: [
                                const Icon(Icons.info_outline, color: Colors.white70, size: 16),
                                const SizedBox(width: 5),
                                Text(
                                  profile['gender'],
                                  style: const TextStyle(color: Colors.white70, fontSize: 16),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              profile['bio'],
                              style: const TextStyle(color: Colors.white, fontSize: 16),
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
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
                  //Dislike
                  FloatingActionButton(
                    heroTag: 'passBtn', 
                    onPressed: () => _handleSwipe(false),
                    backgroundColor: Colors.white,
                    elevation: 5,
                    child: const Icon(Icons.close_rounded, color: Colors.redAccent, size: 35),
                  ),
                  
                  //Like
                  FloatingActionButton(
                    heroTag: 'likeBtn',
                    onPressed: () => _handleSwipe(true),
                    backgroundColor: Colors.white,
                    elevation: 5,
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