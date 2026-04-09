//imports
import 'package:flutter/material.dart';
import 'package:mobile/screens/feed_screen.dart';
import 'services/api_service.dart';
import 'screens/login.dart';
import 'screens/signup.dart';


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
      home: const TitleScreen(), 
      debugShowCheckedModeBanner: false, 
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

//API interactions
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
        width: double.infinity, 
        height: double.infinity, 
        decoration: const BoxDecoration(
          //background colors
          gradient: LinearGradient(
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
            colors: [
              Color.fromARGB(255, 255, 255, 255),
              Color.fromARGB(255, 255, 255, 255),
            ],
          ),
        ),
        child: SafeArea( // Keeps UI out of the phone's notches/status bars
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(height: screenHeight * 0.05), 
                
                // App Logo 
                Image.asset(
                  'assets/Logo_V1.png',
                  width: 500, 
                  height: 500,
                ),
                const SizedBox(height: 20),
                
                // App Name
                const Text(
                  'UKnighted', 
                  style: TextStyle(
                    fontSize: 56,
                    fontWeight: FontWeight.bold,
                    color: const Color.fromARGB(255, 170, 57, 71),
                    letterSpacing: 1.5,
                  ),
                ),
                
                const SizedBox(height: 50), 
                
                // Register Button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const RegisterScreen(), 
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
                      'Register',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                
                const SizedBox(height: 20),
                
                //Login button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const LoginScreen(), 
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
                      'Login',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                
                const SizedBox(height: 60), 
              ],
            ),
          ),
        ),
      ),
    );
  }
}