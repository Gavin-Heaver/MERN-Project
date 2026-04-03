import 'package:flutter/material.dart';
import 'navigation.dart';

class PreferenceScreen extends StatelessWidget {
  const PreferenceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          "Profile Setup",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
            colors: [Colors.pinkAccent, Colors.deepOrangeAccent],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            // Adds breathing room around the edges of the whole scrolling list
            padding: const EdgeInsets.symmetric(horizontal: 30.0, vertical: 20.0),
            
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  "Tell us about yourself",
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 20),
                
                // --- PLACEHOLDERS TO TEST SCROLLING ---
                // You will replace these with your actual dropdowns, buttons, and text fields later!
                
                _buildPlaceholderBox("Sexual Preference Input Area"),
                const SizedBox(height: 20),
                
                _buildPlaceholderBox("Age Range Slider Area"),
                const SizedBox(height: 20),
                
                _buildPlaceholderBox("Bio Text Field Area"),
                const SizedBox(height: 40), // Extra space before the final button
                
                // Continue Button at the very bottom
                ElevatedButton(
                  onPressed: () {
                    // Go to signup 
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => MainNavigation(),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.pinkAccent,
                    minimumSize: const Size(double.infinity, 55),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                  ),
                  child: const Text('Save & Continue', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 20), // Bottom padding so the button doesn't hug the absolute edge
              ],
            ),
          ),
        ),
      ),
    );
  }

  // A quick helper function to draw tall, semi-transparent boxes for you to test the scrolling
  Widget _buildPlaceholderBox(String text) {
    return Container(
      height: 150, // Making them tall forces the screen to scroll
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2), // Semi-transparent white
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.white54),
      ),
      child: Center(
        child: Text(
          text,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}