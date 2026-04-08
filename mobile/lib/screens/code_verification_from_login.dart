import 'package:flutter/material.dart';
import 'set_basic_info.dart'; 
import '../services/api_service.dart'; // Make sure this path is correct for your project!

// 1. Upgraded to a StatefulWidget to manage the typing and loading states
class VerificationScreenFromEmail extends StatefulWidget {
  const VerificationScreenFromEmail({super.key});

  @override
  State<VerificationScreenFromEmail> createState() => _VerificationScreenFromEmailState();
}

class _VerificationScreenFromEmailState extends State<VerificationScreenFromEmail> {
  // 3. Added the controller to read the 6 digits
  final TextEditingController _emailCtrl = TextEditingController();
  final TextEditingController _codeCtrl = TextEditingController();
  String? _error;
  bool _loading = false;

  // 4. The API Verification Function
  Future<void> _verify() async {
    if (_codeCtrl.text.trim().isEmpty || _codeCtrl.text.trim().length != 6) {
      setState(() { _error = "Please enter the full and correct 6-digit code."; });
      return;
    }

    setState(() { _error = null; _loading = true; });

    try {
      await ApiService.verifyCode(
        email: _emailCtrl.text.trim(), 
        code: _codeCtrl.text.trim()
      );
      
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => const BasicInfoScreen(),
          ),
        );
      }
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      setState(() { _loading = false; });
    }
  }

  // Always dispose of controllers!
  @override
  void dispose() {
    _codeCtrl.dispose();
    super.dispose();
  }

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
      body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
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

                //Email
                TextField(
                  controller: _emailCtrl,
                  textAlign: TextAlign.center, // Centers the text
                  style: const TextStyle(
                    color: Colors.black, 
                    fontSize: 24, 
                  ),
                  decoration: InputDecoration(
                    labelText: "Email",
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

                const SizedBox(height: 10),
                
                // 6-Digit Code Input
                TextField(
                  controller: _codeCtrl,
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
                    labelText: "Code",
                    counterText: "", // Hides the "0/6" character counter below the field,
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
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 16),
                    child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 16)),
                  ),
                const SizedBox(height: 40),
                
                // Verify Button
                ElevatedButton(
                  onPressed: _loading ? null : _verify, // 6. Hooked up the logic
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color.fromARGB(255, 170, 57, 71),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                  child: Text(
                    _loading ? 'Verifying...' : 'Verify & Continue', // 7. Dynamic text
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                
                const SizedBox(height: 20),
                
                // Resend Code Option
              ],
            ),
          ),
      ),
    );
  }
}