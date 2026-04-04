import 'package:flutter/material.dart';
import 'set_profile.dart';

class PreferenceScreen extends StatelessWidget {
  const PreferenceScreen({super.key});

 @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,

      backgroundColor: Colors.white,

      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: const Color.fromARGB(255, 170, 57, 71)),
      ),
      
      body: Container(
        child: SafeArea(
          child: SingleChildScrollView(
            // Adds breathing room around the edges of the whole scrolling list
            padding: const EdgeInsets.symmetric(horizontal: 30.0, vertical: 20.0),
            
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Image.asset(
                  'assets/Logo_V2.png',
                  width: 100,
                  height: 100,
                ),
                const Text(
                  "Who are you looking for?",
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color.fromARGB(255, 0, 0, 0)),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                
                // --- PLACEHOLDERS TO TEST SCROLLING ---

                _buildPlaceholderBox("Sexuality"),
                const SizedBox(height: 20),
                
                _buildPlaceholderBox("Preferred Interests"),
                const SizedBox(height: 20),

                _buildPlaceholderBox("DealBreaker Interests"),
                const SizedBox(height: 40),
                
                // Continue Button at the very bottom
                ElevatedButton(
                  onPressed: () {
                    // Go to signup 
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ProfileScreen(),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color.fromARGB(255, 170, 57, 71),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 55),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                  ),
                  child: const Text('Next, your Profile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
        color:  const Color.fromARGB(255, 170, 57, 71).withOpacity(0.2), // Semi-transparent white
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color:  const Color.fromARGB(255, 170, 57, 71)),
      ),
      child: Center(
        child: Text(
          text,
          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}