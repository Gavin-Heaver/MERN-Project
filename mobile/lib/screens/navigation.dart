//imports
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
  // 0 = Feed, 1 = Messages, 2 = Profile
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    FeedScreen(),
    MessagesScreen(),
    ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: _screens[_selectedIndex],
      ),
      bottomNavigationBar: BottomNavigationBar(
        //Button characteristics
        backgroundColor: Colors.white,
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor:const Color.fromARGB(255, 170, 57, 71), 
        unselectedItemColor: Colors.grey,     
        showSelectedLabels: false,   
        showUnselectedLabels: false,
        elevation: 10,     
        items: const [
          //Feed button
          BottomNavigationBarItem(
            icon: Icon(Icons.check_circle_outline, size: 30), 
            activeIcon: Icon(Icons.check_circle, size: 30),  
            label: 'Feed',
          ),
          //Messages button
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_outline_rounded, size: 30),
            activeIcon: Icon(Icons.chat_bubble_rounded, size: 30),
            label: 'Messages',
          ),
          //Profile Button
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