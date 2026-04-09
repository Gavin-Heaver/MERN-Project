//imports
import 'package:flutter/material.dart';
import 'set_profile.dart'; 
import '../services/api_service.dart'; 

class PreferenceScreen extends StatefulWidget {
  const PreferenceScreen({super.key});

  @override
  State<PreferenceScreen> createState() => _PreferenceScreenState();
}

class _PreferenceScreenState extends State<PreferenceScreen> {
  // Variables
  final TextEditingController _ageMinCtrl = TextEditingController();
  final TextEditingController _ageMaxCtrl = TextEditingController();
  final TextEditingController _interestsCtrl = TextEditingController();
  final TextEditingController _dealBreakersCtrl = TextEditingController();

  String _interestedIn = 'Women'; 
  
  String? _error;
  bool _loading = false;

  //Dispose
  @override
  void dispose() {
    _ageMinCtrl.dispose();
    _ageMaxCtrl.dispose();
    _interestsCtrl.dispose();
    _dealBreakersCtrl.dispose();
    super.dispose();
  }

  //API connect
  Future<void> _submit() async {
    if (_ageMinCtrl.text.trim().isEmpty || _ageMaxCtrl.text.trim().isEmpty) {
      setState(() { _error = "Please fill in your age preferences."; });
      return; 
    }

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

    //Interested in genders decisions
    List<String> interestedInGenders = [];
    if (_interestedIn == 'Men') interestedInGenders = ['Male'];
    else if (_interestedIn == 'Women') interestedInGenders = ['Female'];
    else if (_interestedIn == 'Everyone') interestedInGenders = ['Male', 'Female', 'Non-binary', 'Other'];

    setState(() { _error = null; _loading = true; });

    try {
      await ApiService.savePreferences(
        ageMin: ageMin,
        ageMax: ageMax,
        interestedInGenders: interestedInGenders,
        // Passing empty arrays to prevent MongoDB 
        preferredInterestTagIds: [], 
        dealbreakerTagIds: [],
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

  @override
  Widget build(BuildContext context) {
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

              //min and max age
              Row(
                children: [
                  Expanded(child: _buildNumberField("Min Age", _ageMinCtrl)),
                  const SizedBox(width: 20),
                  Expanded(child: _buildNumberField("Max Age", _ageMaxCtrl)),
                ],
              ),
              const SizedBox(height: 10),

              //Genders interested in
              _buildDropdown("Attraction", _interestedIn, ['Men', 'Women', 'Everyone'], (val) {
                setState(() => _interestedIn = val!);
              }),
              const SizedBox(height: 10),

              //Interests and deal breakers
              _buildTextField("Interests", _interestsCtrl),
              const SizedBox(height: 10),
              _buildTextField("Deal Breakers", _dealBreakersCtrl),
              const SizedBox(height: 20),
              
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 16), textAlign: TextAlign.center),
                ),
              
              //submission button
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color.fromARGB(255, 170, 57, 71),
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

  //helper functions
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

  Widget _buildDropdown(String label, String currentValue, List<String> options, ValueChanged<String?> onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: DropdownButtonFormField<String>(
        value: currentValue,
        isExpanded: true,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(15)),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: const BorderSide(color: Color.fromARGB(255, 170, 57, 71), width: 2),
          ),
        ),
        items: options.map((String value) {
          return DropdownMenuItem<String>(value: value, child: Text(value));
        }).toList(),
        onChanged: onChanged,
      ),
    );
  }
}