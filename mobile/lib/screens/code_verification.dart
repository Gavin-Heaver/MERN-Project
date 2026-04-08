//imports
import 'package:flutter/material.dart';
import 'set_basic_info.dart'; 
import '../services/api_service.dart';

class VerificationScreen extends StatefulWidget {
  final String userEmail; 

  //Need email for verification sync
  const VerificationScreen({super.key, required this.userEmail});

  @override
  State<VerificationScreen> createState() => _VerificationScreenState();
}

class _VerificationScreenState extends State<VerificationScreen> {
  //Variables
  final TextEditingController _codeCtrl = TextEditingController();
  String? _error;
  bool _loading = false;

  //API connect
  Future<void> _verify() async {
    //Ensure code length
    if (_codeCtrl.text.trim().isEmpty || _codeCtrl.text.trim().length != 6) {
      setState(() { _error = "Please enter the full and correct 6-digit code."; });
      return;
    }

    setState(() { _error = null; _loading = true; });

    try {
      await ApiService.verifyCode(
        email: widget.userEmail, 
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

  //Dispose
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

      //back button
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
              // little logo and text
              children: [
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
                
                //code submission
                TextField(
                  controller: _codeCtrl,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center, 
                  style: const TextStyle(
                    color: Colors.black, 
                    fontSize: 32, 
                    letterSpacing: 15, 
                    fontWeight: FontWeight.bold,
                  ),
                  decoration: InputDecoration(
                    counterText: "", 
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
                
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 16),
                    child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 16)),
                  ),
                const SizedBox(height: 40),
                
                //button
                ElevatedButton(
                  onPressed: _loading ? null : _verify, 
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color.fromARGB(255, 170, 57, 71),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                  child: Text(
                    _loading ? 'Verifying...' : 'Verify & Continue',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                
                const SizedBox(height: 20),
                
              ],
            ),
          ),
      ),
    );
  }
}