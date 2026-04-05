import 'package:flutter/material.dart';
import 'navigation.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

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
                  "Tell us about yourself",
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color.fromARGB(255, 0, 0, 0)),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                
                // --- PLACEHOLDERS TO TEST SCROLLING ---
                // You will replace these with your actual dropdowns, buttons, and text fields later!
                
                _buildPlaceholderBox("Major"),
                const SizedBox(height: 20),

                _buildPlaceholderBox("Class Year"),
                const SizedBox(height: 20),
                
                _buildPlaceholderBox("Bio"),
                const SizedBox(height: 20),
                
                _buildPlaceholderBox("Photos"),
                const SizedBox(height: 20),

                _buildPlaceholderBox("Work"),
                const SizedBox(height: 20),

                _buildPlaceholderBox("Religion"),
                const SizedBox(height: 20),

                _buildPlaceholderBox("Politics"),
                const SizedBox(height: 20),

                _buildPlaceholderBox("dating intention"),
                const SizedBox(height: 20),

                _buildPlaceholderBox("interest tag IDs"),
                const SizedBox(height: 40),
                
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
                    backgroundColor: const Color.fromARGB(255, 170, 57, 71),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 55),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                  ),
                  child: const Text('Save', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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