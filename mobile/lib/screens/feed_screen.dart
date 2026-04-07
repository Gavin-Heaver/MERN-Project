import 'package:flutter/material.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  // 1. Mock Database of Profiles
  final List<Map<String, dynamic>> _profiles = [
    {
      'id': '101',
      'name': 'Taylor',
      'age': 21,
      'gender': 'Female',
      'bio': 'CS major. Catch me at the library or getting coffee. ☕️',
      // We use a color placeholder here, but later this will be a NetworkImage URL
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

  // Keeps track of which profile we are currently looking at
  int _currentIndex = 0;

  // 2. The Logic Function for Swiping/Buttons
  void _handleSwipe(bool isLike) {
    if (_currentIndex >= _profiles.length) return;

    final currentProfile = _profiles[_currentIndex];

    if (isLike) {
      // TODO: Send API request to Express/MongoDB
      // Example: api.likeUser(currentUserId, currentProfile['id'])
      print("You LIKED ${currentProfile['name']}. Triggering notification check...");
      
      // If the backend returns "MATCH!", this is where you would pop up an alert
      // or automatically add them to the active chats list!
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
    // 3. Handle the "Out of Profiles" state
    if (_currentIndex >= _profiles.length) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
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

    // Grab the data for the profile currently on top of the deck
    final profile = _profiles[_currentIndex];

    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SafeArea(
        child: Column(
          children: [
            // TOP APP BAR AREA
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset('assets/Logo_V2.png', height: 36, width: 36, fit: BoxFit.contain),
                  SizedBox(width: 8),
                  Text(
                    'Uknighted',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
                ],
              ),
            ),

            // THE PROFILE CARD
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // BACKGROUND IMAGE (Using a colored container and icon as a placeholder)
                      Container(
                        color: profile['color'],
                        child: const Icon(Icons.person, size: 150, color: Colors.white30),
                        // LATER: Replace the Container with this:
                        // Image.network(profile['imageUrl'], fit: BoxFit.cover),
                      ),

                      // GRADIENT OVERLAY (Makes the white text readable over any image)
                      const DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black87, // Darkens at the bottom
                            ],
                            stops: [0.6, 1.0], // Starts getting dark 60% of the way down
                          ),
                        ),
                      ),

                      // PROFILE TEXT INFO
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

            // THE ACTION BUTTONS (X and Check)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  // Dislike / Pass Button
                  FloatingActionButton(
                    heroTag: 'passBtn', // Needed if using multiple FABs on one screen
                    onPressed: () => _handleSwipe(false),
                    backgroundColor: Colors.white,
                    elevation: 5,
                    child: const Icon(Icons.close_rounded, color: Colors.redAccent, size: 35),
                  ),
                  
                  // Like Button
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
            
            // Adding a little bottom padding to account for the nav bar
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }
}