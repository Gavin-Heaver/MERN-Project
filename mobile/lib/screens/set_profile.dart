//imports
import 'package:flutter/material.dart';
import 'navigation.dart';
import '../services/api_service.dart'; 

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  //Variables
  final TextEditingController _bioCtrl = TextEditingController();
  final TextEditingController _workCtrl = TextEditingController();
  
  String _datingIntentionCtrl = 'Long-term relationship';
   
  String? _error;
  bool _loading = false;

  //Dispose
  @override
  void dispose() {
    _bioCtrl.dispose();
    _workCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_bioCtrl.text.trim().isEmpty) {
      setState(() { _error = "Please write a short bio to continue."; });
      return; 
    }

    setState(() { _error = null; _loading = true; });

    try {
      await ApiService.saveProfile(
        bio: _bioCtrl.text.trim(),
        photos: [], // Still sending an empty array for photos for now!
        datingIntentions: _datingIntentionCtrl, // Plugs in the dropdown value!
      );

      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const MainNavigation()), 
          (route) => false, 
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
                "Tell us about yourself",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.black),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),
              
              //Photos needs to be figured out a bit
              const Center(child: Text("Photos Need to be here", style: TextStyle(color: Colors.grey))),
              const SizedBox(height: 20),
              
              //bio
              _buildTextField("Bio", _bioCtrl),
              const SizedBox(height: 10),

              _buildDropdown("Dating Intentions", _datingIntentionCtrl, ['Long-term relationship', 'Short-term', 'New friends', 'Figuring it out'], (val) => setState(() => _datingIntentionCtrl = val!)),
              const SizedBox(height: 20),
              
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 16), textAlign: TextAlign.center),
                ),

              // Submission button
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color.fromARGB(255, 170, 57, 71),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 55),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                ),
                child: Text(
                  _loading ? 'Saving...' : 'Finish & Explore', 
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

  // Helper Functions
  Widget _buildTextField(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        controller: controller,
        maxLines: label == "Bio" ? 3 : 1, 
        decoration: InputDecoration(
          labelText: label,
          alignLabelWithHint: true,
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
          return DropdownMenuItem<String>(value: value, child: Text(value, overflow: TextOverflow.ellipsis));
        }).toList(),
        onChanged: onChanged,
      ),
    );
  }
}