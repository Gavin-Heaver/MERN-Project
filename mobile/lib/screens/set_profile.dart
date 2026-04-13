import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart'; // Required for photo selection
import 'navigation.dart';
import '../services/api_service.dart'; 

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final TextEditingController _bioCtrl = TextEditingController();
  
  String _datingIntentionCtrl = 'Long-term relationship';
  String? _localImagePath; // Stores the picked image path locally
   
  String? _error;
  bool _loading = false;

  @override
  void dispose() {
    _bioCtrl.dispose();
    super.dispose();
  }

  // Opens the gallery to pick a profile photo
  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80, // Reduces file size to stay under 5MB limit
    );
    
    if (image != null) {
      setState(() {
        _localImagePath = image.path;
      });
    }
  }

  Future<void> _submit() async {
    if (_localImagePath == null) {
      setState(() { _error = "Please upload a photo to continue."; });
      return; 
    }
    
    if (_bioCtrl.text.trim().isEmpty) {
      setState(() { _error = "Please write a short bio to continue."; });
      return; 
    }

    setState(() { _error = null; _loading = true; });

    try {
      // 1. Upload the physical photo first to /users/me/photos
      await ApiService.uploadPhoto(_localImagePath!);

      // 2. Save the rest of the profile data
      // Backend sets isPrimary automatically for the first photo
      await ApiService.saveProfile(
        bio: _bioCtrl.text.trim(),
        photos: [], // Send empty array as backend handles photo tracking
        datingIntentions: _datingIntentionCtrl,
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
    const Color crimson = Color.fromARGB(255, 170, 57, 71);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 30.0, vertical: 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Image.asset('assets/Logo_V2.png', width: 100, height: 100),
              const Text(
                "Final Touches",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.black),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),
              
              // Tappable Photo Upload Area
              Center(
                child: GestureDetector(
                  onTap: _pickImage,
                  child: Container(
                    height: 200,
                    width: 150,
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(color: Colors.grey[300]!),
                      image: _localImagePath != null 
                        ? DecorationImage(
                            image: FileImage(File(_localImagePath!)), 
                            fit: BoxFit.cover
                          ) 
                        : null,
                    ),
                    child: _localImagePath == null 
                      ? const Icon(Icons.add_a_photo, size: 50, color: Colors.grey) 
                      : null,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                "This will be your primary profile picture",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 12),
              ),
              const SizedBox(height: 30),
              
              _buildTextField("Bio", _bioCtrl),
              const SizedBox(height: 10),

              _buildDropdown(
                "Dating Intentions", 
                _datingIntentionCtrl, 
                ['Long-term relationship', 'Short-term', 'New friends', 'Figuring it out'], 
                (val) => setState(() => _datingIntentionCtrl = val!)
              ),
              const SizedBox(height: 20),
              
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Text(
                    _error!, 
                    style: const TextStyle(color: Colors.red, fontSize: 16), 
                    textAlign: TextAlign.center
                  ),
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

  Widget _buildTextField(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        controller: controller,
        maxLines: 3, 
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