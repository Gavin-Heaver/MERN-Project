import 'package:flutter/material.dart';
import 'set_profile.dart'; // Make sure this path is correct
import '../services/api_service.dart'; // Make sure this path is correct

class PreferenceScreen extends StatefulWidget {
  const PreferenceScreen({super.key});

  @override
  State<PreferenceScreen> createState() => _PreferenceScreenState();
}

class _PreferenceScreenState extends State<PreferenceScreen> {
  // Controllers
  final TextEditingController _ageMinCtrl = TextEditingController();
  final TextEditingController _ageMaxCtrl = TextEditingController();

  // --- NEW: Checklist State Variables ---
  bool _allSelected = false;
  
  // This holds exactly what they check off (e.g., ['Male', 'Non-binary'])
  final List<String> _interestedInGenders = []; 
  
  // The master list of options to display
  final List<String> _availableGenders = ['Male', 'Female', 'Non-binary', 'Other'];
  
  String? _error;
  bool _loading = false;

  @override
  void dispose() {
    _ageMinCtrl.dispose();
    _ageMaxCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    // 1. Check for empty fields
    if (_ageMinCtrl.text.trim().isEmpty || _ageMaxCtrl.text.trim().isEmpty) {
      setState(() { _error = "Please fill in your age preferences."; });
      return; 
    }

    // 2. NEW: Ensure they checked at least one box!
    if (_interestedInGenders.isEmpty) {
      setState(() { _error = "Please select at least one gender you are interested in."; });
      return;
    }

    // 3. Parse and Validate Ages
    int? ageMin = int.tryParse(_ageMinCtrl.text.trim());
    int? ageMax = int.tryParse(_ageMaxCtrl.text.trim());

    if (ageMin == null || ageMax == null || ageMin < 18 || ageMax > 99) {
      setState(() { _error = "Ages must be valid numbers between 18 and 99."; });
      return;
    }

    if (ageMin > ageMax) {
      setState(() { _error = "Minimum age cannot be greater than maximum age."; });
      return;
    }

    setState(() { _error = null; _loading = true; });

    try {
      // 4. Send the API request
      await ApiService.savePreferences(
        ageMin: ageMin,
        ageMax: ageMax,
        // We can pass the array directly now! No translation needed.
        interestedInGenders: _interestedInGenders,
      );

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const ProfileScreen())
        );
      }
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      setState(() { _loading = false; });
    }
  }

  void _toggleAll(bool? selected) {
    setState(() {
      _allSelected = selected ?? false;
      _interestedInGenders.clear();
      if (_allSelected) {
        // Add everything if "All" is checked
        _interestedInGenders.addAll(_availableGenders);
      }
    });
  }

  // 3. Logic to handle individual checkboxes and auto-toggle "All"
  void _toggleGender(String gender, bool? selected) {
    setState(() {
      if (selected == true) {
        _interestedInGenders.add(gender);
      } else {
        _interestedInGenders.remove(gender);
      }

      // Auto-turn on "All" if every single gender is now picked
      if (_interestedInGenders.length == _availableGenders.length) {
        _allSelected = true;
      } else {
        _allSelected = false;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    const Color crimson = Color.fromARGB(255, 170, 57, 71);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
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
                "Who are you looking for?",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.black),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),

              Row(
                children: [
                  Expanded(child: _buildNumberField("Min Age", _ageMinCtrl)),
                  const SizedBox(width: 20),
                  Expanded(child: _buildNumberField("Max Age", _ageMaxCtrl)),
                ],
              ),
              const SizedBox(height: 10),

              // --- NEW: The Checklist Widget ---
              const Text(
                "Interested In", 
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87)
              ),
              const SizedBox(height: 8),
              _buildGenderChecklist(),
              const SizedBox(height: 20),
              
              // Error Display
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 16), textAlign: TextAlign.center),
                ),
              
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: crimson,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 55),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                ),
                child: Text(
                  _loading ? 'Saving...' : 'Next, your Profile', 
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)
                ),
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
  
  // --- NEW: Custom Checklist Builder ---
  Widget _buildGenderChecklist() {
    const Color crimson = Color.fromARGB(255, 170, 57, 71);

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[400]!),
        borderRadius: BorderRadius.circular(15),
      ),
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Column(
        children: [
          // The "All" Button
          CheckboxListTile(
            title: const Text("All", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            value: _allSelected,
            activeColor: crimson,
            controlAffinity: ListTileControlAffinity.leading,
            dense: true,
            onChanged: _toggleAll,
          ),
          const Divider(height: 1), // Visual separator
          
          // Individual Gender Buttons
          ..._availableGenders.map((gender) {
            return CheckboxListTile(
              title: Text(gender, style: const TextStyle(fontSize: 16)),
              value: _interestedInGenders.contains(gender),
              activeColor: crimson,
              controlAffinity: ListTileControlAffinity.leading,
              dense: true,
              onChanged: (bool? selected) => _toggleGender(gender, selected),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(15)),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: const BorderSide(color: Color.fromARGB(255, 170, 57, 71), width: 2),
          ),
        ),
      ),
    );
  }

  Widget _buildNumberField(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        keyboardType: TextInputType.number,
        maxLength: 2, 
        controller: controller,
        decoration: InputDecoration(
          counterText: "",
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(15)),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: const BorderSide(color: Color.fromARGB(255, 170, 57, 71), width: 2),
          ),
        ),
      ),
    );
  }
}