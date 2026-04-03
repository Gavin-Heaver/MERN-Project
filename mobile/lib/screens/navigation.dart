//Navigation

import 'package:flutter/material.dart';
import 'feed_screen.dart';
import 'messages.dart';
import 'profile.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  // Keeps track of which tab is selected. 0 = Feed, 1 = Messages, 2 = Profile
  int _selectedIndex = 0;

  // The list of screens that correspond to the tabs
  final List<Widget> _screens = const [
    FeedScreen(),
    MessagesScreen(),
    ProfileScreen(),
  ];

  // Function to handle tapping a tab
  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      // The body simply displays the screen from the list based on the selected index
      body: SafeArea(
        child: _screens[_selectedIndex],
      ),
      // The bottom navigation bar
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: Colors.white,
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor:const Color.fromARGB(255, 170, 57, 71), // Brand color for active tab
        unselectedItemColor: Colors.grey,     // Grey for inactive tabs
        showSelectedLabels: false,            // Hiding labels makes it look cleaner
        showUnselectedLabels: false,
        elevation: 10,                        // Adds a slight shadow above the bar
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.style_outlined, size: 30), // Cards/Deck icon
            activeIcon: Icon(Icons.style, size: 30),    // Filled version when active
            label: 'Feed',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_outline_rounded, size: 30),
            activeIcon: Icon(Icons.chat_bubble_rounded, size: 30),
            label: 'Messages',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline_rounded, size: 30),
            activeIcon: Icon(Icons.person_rounded, size: 30),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}