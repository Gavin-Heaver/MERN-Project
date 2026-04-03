import 'package:flutter/material.dart';
import 'navigation.dart'; //import 'code_verification';
import '../services/api_service.dart';

class VerificationScreen extends StatelessWidget {
  const VerificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,

      backgroundColor: Colors.white,

      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.pinkAccent),
      ),
      body: Container(
        
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Icon for visual flair
                const Icon(
                  Icons.mark_email_read_rounded,
                  size: 80,
                  color: Colors.black,
                ),
                const SizedBox(height: 20),
                
                const Text(
                  'Check your email',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 10),
                
                const Text(
                  'We sent a 6-digit verification code to complete your registration.',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.black,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 40),
                
                // 6-Digit Code Input
                TextField(
                  keyboardType: TextInputType.number,
                  maxLength: 6, // Restricts input to 6 characters
                  textAlign: TextAlign.center, // Centers the text
                  style: const TextStyle(
                    color: Colors.black, 
                    fontSize: 32, 
                    letterSpacing: 15, // Spreads the numbers out to look like an OTP field
                    fontWeight: FontWeight.bold,
                  ),
                  decoration: InputDecoration(
                    counterText: "", // Hides the "0/6" character counter below the field
                    hintText: "••••••",
                    hintStyle: const TextStyle(color: Colors.grey, letterSpacing: 15),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15),
                      borderSide: const BorderSide(color: Colors.black),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15),
                      borderSide: const BorderSide(color: Colors.black, width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 40),
                
                // Verify Button
                ElevatedButton(
                  onPressed: () {
                    // TODO: Eventually connect to your MongoDB/Express API here.
                    // For now, we mock a successful verification and route to the Homepage.
                    
                    print("Code Verified!");
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const MainNavigation(),
                      ),
                    );
                    
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color.fromARGB(255, 170, 57, 71),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                  child: const Text(
                    'Verify & Continue',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                
                const SizedBox(height: 20),
                
                // Resend Code Option
                TextButton(
                  onPressed: () {
                    print("Trigger API to resend code");
                  },
                  child: const Text(
                    "Didn't receive a code? Resend",
                    style: TextStyle(
                      color: Colors.black,
                      decoration: TextDecoration.underline,
                      decorationColor: Colors.black,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}