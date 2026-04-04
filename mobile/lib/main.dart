import 'package:flutter/material.dart';
import 'package:mobile/screens/feed_screen.dart';
import '../services/api_service.dart';
import 'screens/login.dart';
import 'screens/signup.dart';
import 'screens/navigation.dart';

void main() {
  runApp(const UKnightedApp());
}

class UKnightedApp extends StatelessWidget {
  const UKnightedApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UKnighted',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.pink),
        useMaterial3: true,
      ),
      home: const MainNavigation(), // Set the TitleScreen as the starting point
      debugShowCheckedModeBanner: false, // Hides the annoying debug banner
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  bool _checking = true;
  bool _loggedIn = false;

  @override
  void initState() {
    super.initState();
    ApiService.getToken().then((token) {
      setState(() {
        _loggedIn = token != null;
        _checking = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_checking) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    return _loggedIn ? const FeedScreen() : const TitleScreen();
  }
}

class TitleScreen extends StatelessWidget {
  const TitleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      // A Scaffold provides the high-level visual structure
      body: Container(
        width: double.infinity, // Take up full width
        height: double.infinity, // CRUCIAL: Forces the gradient background to cover the whole screen even if scrolling
        decoration: const BoxDecoration(
          // gradient background
          gradient: LinearGradient(
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
            colors: [
              Color.fromARGB(255, 255, 168, 216),
              Color.fromARGB(255, 255, 251, 0),
            ],
          ),
        ),
        child: SafeArea( // Keeps UI out of the phone's notches/status bars
          // THE FIX: Wrap the Column in a SingleChildScrollView
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // REPLACED Spacer: Added a bit of fixed breathing room at the very top
                SizedBox(height: screenHeight * 0.05), 
                
                // App Logo 
                Image.asset(
                  'assets/Logo_V1.png',
                  width: 500, // Leaving this large will easily let you test the new scrolling!
                  height: 500,
                ),
                const SizedBox(height: 20),
                
                // App Name
                const Text(
                  'UKnighted', 
                  style: TextStyle(
                    fontSize: 56,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 1.5,
                  ),
                ),
                
                // REPLACED Spacer: Fixed gap between the title and the buttons
                const SizedBox(height: 50), 
                
                // Register Button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: ElevatedButton(
                    onPressed: () {
                      // Go to register 
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const RegisterScreen(), // Added 'const' for better performance
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color.fromARGB(255, 170, 57, 71),
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(25),
                      ),
                    ),
                    child: const Text(
                      'Register',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                
                const SizedBox(height: 20),
                
                // Login Button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: ElevatedButton(
                    onPressed: () {
                      // Go to login 
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const LoginScreen(), // Added 'const'
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color.fromARGB(255, 170, 57, 71),
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(25),
                      ),
                    ),
                    child: const Text(
                      'Login',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                
                // Bottom padding to ensure the scroll goes all the way past the lowest button
                const SizedBox(height: 60), 
              ],
            ),
          ),
        ),
      ),
    );
  }
}