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

  // Inside _ProfileScreenState
  final List<String?> _localImages = List.filled(6, null); // Holds paths for 6 slots
  int _uploadCount = 0; // To track progress during submission

  // Opens the gallery to pick a photo for a specific slot
  Future<void> _pickImage(int index) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 50, // Reduced quality further to ensure 6 photos stay under total limits
    );
    
    if (image != null) {
      setState(() {
        _localImages[index] = image.path;
      });
    }
  }

  Future<void> _submit() async {
    // Check if at least the first photo (primary) is provided
    if (_localImages[0] == null) {
      setState(() { _error = "Please upload at least the first photo."; });
      return; 
    }
    
    if (_bioCtrl.text.trim().isEmpty) {
      setState(() { _error = "Please write a short bio."; });
      return; 
    }

    setState(() { _error = null; _loading = true; });

    try {
      // 1. Loop through all non-null image paths and upload them
      for (String? path in _localImages) {
        if (path != null) {
          await ApiService.uploadPhoto(path);
        }
      }

      // 2. Save the rest of the profile data
      await ApiService.saveProfile(
        bio: _bioCtrl.text.trim(),
        photos: [], // Backend array is already populated by the uploads above
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
      setState(() { _error = "Upload failed: $e"; });
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
              
              // Inside the Column in build()
              const Text(
                "Upload your photos (First photo is primary)",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 15),

              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 0.8,
                ),
                itemCount: 6,
                itemBuilder: (context, index) {
                  final String? path = _localImages[index];
                  return GestureDetector(
                    onTap: () => _pickImage(index),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: index == 0 ? crimson : Colors.grey[300]!, 
                          width: index == 0 ? 2 : 1
                        ),
                        image: path != null 
                          ? DecorationImage(image: FileImage(File(path)), fit: BoxFit.cover) 
                          : null,
                      ),
                      child: path == null 
                        ? Icon(Icons.add_a_photo, color: index == 0 ? crimson : Colors.grey) 
                        : null,
                    ),
                  );
                },
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