import 'package:flutter/material.dart';
import 'set_preferences.dart';
 
class BasicInfoScreen extends StatefulWidget {
  const BasicInfoScreen({super.key});

  @override
  State<BasicInfoScreen> createState() => _BasicInfoScreenState();
}

class _BasicInfoScreenState extends State<BasicInfoScreen> {
  // 1. ALL Text Fields must be controlled by TextEditingControllers
  final TextEditingController _firstNameCtrl = TextEditingController();
  final TextEditingController _lastNameCtrl = TextEditingController();
  final TextEditingController _ageCtrl = TextEditingController();
  final TextEditingController _heightCtrl = TextEditingController();
  
  // 2. Dropdown menus need a starting String value
  String _gender = 'Male'; 
  String _ethnicity = 'Prefer not to say'; 
  
  // Clean up the memory when leaving the screen!
  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _ageCtrl.dispose();
    _heightCtrl.dispose();
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
                "Who are you?",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color.fromARGB(255, 0, 0, 0)),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),
              
              // 3. Replaced Placeholders with your actual Helper Functions!
              
              _buildTextField("First Name", _firstNameCtrl),
              const SizedBox(height: 10),
              
              _buildTextField("Last Name", _lastNameCtrl),
              const SizedBox(height: 10),

              _buildNumberField("Age", _ageCtrl),               
              const SizedBox(height: 10),

              _buildDropdown("Gender", _gender, ['Male', 'Female', 'Non-binary', 'Other'], (val) {
                setState(() => _gender = val!);
              }),
              const SizedBox(height: 10),
              
              _buildTextField("Height (e.g. 5' 10\")", _heightCtrl),
              const SizedBox(height: 10),

              _buildDropdown("Ethnicity", _ethnicity, ['Prefer not to say', 'Asian', 'Black/African', 'Hispanic/Latino', 'White/Caucasian', 'Mixed', 'Other'], (val) {
                setState(() => _ethnicity = val!);
              }),
              const SizedBox(height: 40),
              
              // Continue Button at the very bottom
              ElevatedButton(
                onPressed: () {
                  // Go to preferences 
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const PreferenceScreen(), // Make sure your class name matches here
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

  // FIXED: Changed int? to TextEditingController
  Widget _buildNumberField(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        keyboardType: TextInputType.number,
        maxLength: 3,
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