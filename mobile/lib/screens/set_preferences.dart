import 'package:flutter/material.dart';
import 'set_profile.dart';

class PreferenceScreen extends StatefulWidget {
  const PreferenceScreen({super.key});

  @override
  State<PreferenceScreen> createState() => _PreferenceScreenState();
}

class _PreferenceScreenState extends State<PreferenceScreen> {
  // 1. ALL Text Fields must be controlled by TextEditingControllers
  final TextEditingController _interestsCtrl = TextEditingController();
  final TextEditingController _dealBreakersCtrl = TextEditingController();

  
  // 2. Dropdown menus need a starting String value
  String _sexualOrientation = 'Straight'; 
  
  // Clean up the memory when leaving the screen!
  @override
  void dispose() {
    _interestsCtrl.dispose();
    _dealBreakersCtrl.dispose();
    super.dispose();
  }

    /*
  String? _error;
  bool _loading = false;

  Future<void> _submit() async {
    if (_emailCtrl.text.trim().isEmpty || _passwordCtrl.text.isEmpty) {
      setState(() { _error = "Please fill in all fields."; });
      return; // Stops the function here
    }

    // 2. Optional: Enforce a university email requirement
    if (!_emailCtrl.text.trim().toLowerCase().endsWith('.edu')) {
      setState(() { _error = "You must use a valid university .edu email."; });
      return;
    }

    setState(() { _error = null; _loading = true; });
    try {
      await ApiService.register(
        email: _emailCtrl.text.trim(),
        password: _passwordCtrl.text
      );
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const VerificationScreen())
        );
      }
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      setState(() { _loading = false; });
    }
  }
  @override
    void dispose() {
      _emailCtrl.dispose();
      _passwordCtrl.dispose();
      super.dispose();
    }
  */

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
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
                "Who are you looking for?",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color.fromARGB(255, 0, 0, 0)),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),

              _buildDropdown("Sexual Orientation", _sexualOrientation, ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Other'], (val) {
                setState(() => _sexualOrientation = val!);
              }),
              const SizedBox(height: 10),

              _buildTextField("Interests", _interestsCtrl),
              const SizedBox(height: 10),
              
              _buildTextField("Deal Breakers", _dealBreakersCtrl),
              const SizedBox(height: 40),
              
              // Continue Button at the very bottom
              ElevatedButton(
                onPressed: () {
                  // Go to preferences 
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ProfileScreen(), // Make sure your class name matches here
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
              const SizedBox(height: 20), 
            ],
          ),
        ),
      ),
    );
  }

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  Widget _buildTextField(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: const BorderSide(color: Color.fromARGB(255, 170, 57, 71), width: 2),
          ),
        ),
      ),
    );
  }


  Widget _buildDropdown(String label, String currentValue, List<String> options, ValueChanged<String?> onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: DropdownButtonFormField<String>(
        value: currentValue,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: const BorderSide(color: Color.fromARGB(255, 170, 57, 71), width: 2),
          ),
        ),
        items: options.map((String value) {
          return DropdownMenuItem<String>(
            value: value,
            child: Text(value),
          );
        }).toList(),
        onChanged: onChanged,
      ),
    );
  }
}