import 'package:flutter/material.dart';

class FeedScreen extends StatelessWidget {
  const FeedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold( // <-- This is the magic fix!
      backgroundColor: Colors.white, // Gives it a clean, solid background
      body: Center(
        child: Text(
          'Swipe Screen', 
          style: TextStyle(
            fontSize: 24, 
            fontWeight: FontWeight.bold,
            color: Colors.black, // Explicitly setting the color helps too
          ),
        ),
      ),
    );
  }
}