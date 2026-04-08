import 'package:flutter/material.dart';
import 'navigation.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  // 1. ALL Text Fields must be controlled by TextEditingControllers
  final TextEditingController _majorCtrl = TextEditingController();
  final TextEditingController _workCtrl = TextEditingController();
  final TextEditingController _bioCtrl = TextEditingController();
  
  // 2. Dropdown menus need a starting String value
  String _politicalCtrl = 'Apolitical'; 
  String _religionCtrl = 'Christian'; 
  String _classyearCtrl = 'Freshman'; 
  String _datingIntentionCtrl = 'Long-term relationship';
   
  
  // Clean up the memory when leaving the screen!
  @override
  void dispose() {
    _majorCtrl.dispose();
    _workCtrl.dispose();
    _bioCtrl.dispose();
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
                "Tell us about yourself",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color.fromARGB(255, 0, 0, 0)),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),
              
              // 3. Replaced Placeholders with your actual Helper Functions!
              
              const Text("Photos Need to be here"),
              
              _buildTextField("Bio", _bioCtrl),
              const SizedBox(height: 10),
              
              //_buildTextField("Major", _majorCtrl),
              //const SizedBox(height: 10),

              _buildDropdown("Class Year", _classyearCtrl, ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad Student'], (val) => setState(() => _classyearCtrl = val!)),
              const SizedBox(height: 10),

              _buildTextField("Work", _workCtrl),
              const SizedBox(height: 10),

              _buildDropdown("Religion", _religionCtrl, ['Christian', 'Catholic', 'Jewish', 'Muslim', 'Atheist', 'Agnostic', 'Spiritual', 'Other'], (val) => setState(() => _religionCtrl = val!)),
              const SizedBox(height: 10),

              _buildDropdown("Political Alignment", _politicalCtrl, ['Liberal', 'Moderate', 'Conservative', 'Apolitical', 'Other'], (val) => setState(() => _politicalCtrl = val!)),
              const SizedBox(height: 10),

              _buildDropdown("Dating Intentions", _datingIntentionCtrl, ['Long-term relationship', 'Short-term', 'New friends', 'Figuring it out'], (val) => setState(() => _datingIntentionCtrl = val!)),
              const SizedBox(height: 40),
              
              // Continue Button at the very bottom
              ElevatedButton(
                onPressed: () {
                  // Go to preferences 
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const MainNavigation(), // Make sure your class name matches here
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