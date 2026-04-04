import 'package:flutter/material.dart';
import 'set_preferences.dart';
 
class BasicInfoScreen extends StatelessWidget {
  const BasicInfoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,

      backgroundColor: Colors.white,
      
      body: Container(
        child: SafeArea(
          child: SingleChildScrollView(
            // Adds breathing room around the edges of the whole scrolling list
            padding: const EdgeInsets.symmetric(horizontal: 30.0, vertical: 20.0),
            
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                              // App Logo 
                Image.asset(
                  'assets/Logo_V2.png',
                  width: 100,
                  height: 100,
                ),
                const Text(
                  "Who are you?",
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color.fromARGB(255, 0, 0, 0)),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                
                // --- PLACEHOLDERS TO TEST SCROLLING ---
                // You will replace these with your actual dropdowns, buttons, and text fields later!
                
                _buildPlaceholderBox("First Name"),
                const SizedBox(height: 20),
                
                _buildPlaceholderBox("Last"),
                const SizedBox(height: 20),

                _buildPlaceholderBox("Age"),
                const SizedBox(height: 20),

                _buildPlaceholderBox("Gender"),
                const SizedBox(height: 20),
                
                _buildPlaceholderBox("Height"),
                const SizedBox(height: 20),

                _buildPlaceholderBox("Ethnicity"),
                const SizedBox(height: 40),
                
                // Continue Button at the very bottom
                ElevatedButton(
                  onPressed: () {
                    // Go to signup 
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PreferenceScreen(),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color.fromARGB(255, 170, 57, 71),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 55),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                  ),
                  child: const Text('Next, Preferences', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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