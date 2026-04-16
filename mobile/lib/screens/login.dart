//imports
import 'package:flutter/material.dart';
import 'navigation.dart'; 
import 'set_basic_info.dart';
import 'set_profile.dart';
import 'set_preferences.dart';
import '../services/api_service.dart';
import 'code_verification_from_login.dart';
import 'forgot_password.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  //Variables
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  //API contact
  Future<void> _submit() async {
    setState(() { _error = null; _loading = true; });
    try {
      await ApiService.login(
        email: _emailCtrl.text.trim(),
        password: _passwordCtrl.text,
      );

      final profileData = await ApiService.getUserProfile();
      final userObject = profileData['user'] ?? {};

      //Check if user has submitted all info
      final bool isBasicInfoComplete = userObject['basicInfo']?['basicInfoComplete'] ?? false;
      final bool isPreferencesComplete = userObject['preferences']?['preferencesComplete'] ?? false;
      final bool isProfileComplete = userObject['profile']?['profileComplete'] ?? false;

      //Branching based on what user info has been submitted
      if (mounted) {
        if (!isBasicInfoComplete) {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const BasicInfoScreen()));
        } else if (!isPreferencesComplete) {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const PreferenceScreen()));
        } else if (!isProfileComplete) {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const ProfileScreen())); 
        } else {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const MainNavigation())); 
        }
      }
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      backgroundColor: Colors.white,

      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: const Color.fromARGB(255, 170, 57, 71)),
      ),

      body: SafeArea( 
        child: SingleChildScrollView( 
          padding: const EdgeInsets.all(24), 
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              //Logo
              Image.asset(
                  'assets/Logo_V1.png',
                  width: 350,
                  height: 350,
              ),
              const SizedBox(height: 0),

              const Text(
                'Login',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              
              //Email 
              TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'University Email',
                  prefixIcon: const Icon(Icons.email_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              
              //Password
              TextField(
                controller: _passwordCtrl,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(Icons.lock_outline),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
              ),

              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(_error!, style: const TextStyle(color: Colors.red), textAlign: TextAlign.center)
                ),

              const SizedBox(height: 40),
              
              //Submit button
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color.fromARGB(255, 170, 57, 71),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25),
                  ),
                ),
                child: Text(
                  _loading ? 'Logging in...' : 'Log In',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),

              const SizedBox(height: 20),

                            TextButton(
                onPressed: () {
                 Navigator.of(context).pushReplacement(
                    MaterialPageRoute(
                      builder: (_) => ForgotPasswordScreen( 
                      )
                    )
                  );
                },
                style: TextButton.styleFrom(
                  foregroundColor: const Color.fromARGB(255, 170, 57, 71), 
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10), 
                ),
                child: const Text(
                  "Forgot Password",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),

              //Verificaiton button
              TextButton(
                onPressed: () {
                 Navigator.of(context).pushReplacement(
                    MaterialPageRoute(
                      builder: (_) => VerificationScreenFromEmail( 
                      )
                    )
                  );
                },
                style: TextButton.styleFrom(
                  foregroundColor: const Color.fromARGB(255, 170, 57, 71), 
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10), 
                ),
                child: const Text(
                  "Verification Code Screen",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),

              const SizedBox(height: 60),
            ],
          ),
        ),
      ),
    );
  }
}