import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
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
  
  String _datingIntentionCtrl = 'Long-term Relationship';
  String? _localImagePath; // Stores the picked image path locally

  List<dynamic> _promptAnswers = []; 
  final List<String> _availablePrompts = [
    "A green flag I look for is...",
    "My love language is...",
    "The way to win me over is...",
    "I'm looking for someone who...",
    "A fun fact about me is..."
  ];
  
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
      imageQuality: 70, 
      // THE FIX: Force the image to resize, guaranteeing it stays under 5MB
      maxWidth: 1080,
      maxHeight: 1080,
    );
    
    if (image != null) {
      setState(() {
        _localImages[index] = image.path;
      });
    }
  }

  void _onPhotoSlotTapped(int index) {
    if (_localImages[index] == null) {
      // Slot is empty, go straight to picking an image
      _pickImage(index);
    } else {
      // Slot has an image, show options
      showModalBottomSheet(
        context: context,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        builder: (context) => SafeArea(
          child: Wrap(
            children: [
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text("Change Photo"),
                onTap: () {
                  Navigator.pop(context); // Close the bottom sheet
                  _pickImage(index);      // Re-trigger the picker for this slot
                },
              ),
              ListTile(
                leading: const Icon(Icons.delete, color: Colors.red),
                title: const Text("Remove Photo", style: TextStyle(color: Colors.red)),
                onTap: () {
                  Navigator.pop(context);
                  setState(() {
                    _localImages[index] = null; // Clear the slot
                  });
                },
              ),
            ],
          ),
        ),
      );
    }
  }

  Future<void> _submit() async {
    // 1. Existing validations...
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
      // 2. Upload the images to the server
      for (String? path in _localImages) {
        if (path != null) {
          await ApiService.uploadPhoto(path);
        }
      }

      // 3. THE FIX: Fetch the user's updated profile to get the photo list the backend just created
      final updatedProfile = await ApiService.getUserProfile();
      if (!mounted) return;
      final List<dynamic> savedPhotos = updatedProfile['user']['profile']['photos'] ?? [];

      // 4. Save the full profile, passing the retrieved photos back to the server
      await ApiService.saveProfile(
        bio: _bioCtrl.text.trim(),
        photos: savedPhotos, // Use the list we just fetched
        datingIntentions: _datingIntentionCtrl,
        promptAnswers: _promptAnswers,
      );
      if (!mounted) return;

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

    void _addPrompt() {
    if (_promptAnswers.length < 3) {
      setState(() {
        _promptAnswers.add({"question": _availablePrompts[0], "answer": ""});
      });
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
                "Your Profile",
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
                    onTap: () => _onPhotoSlotTapped(index),
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
                ['Long-term Relationship', 'Short-term Relationship', 'New friends', 'Figuring it out', 'Prefer not to say'], 
                (val) => setState(() => _datingIntentionCtrl = val!)
              ),

              Text(
                "Prompts",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              
              ..._promptAnswers.asMap().entries.map((entry) {
                int idx = entry.key;
                return Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _buildDropdown(
                            "Select Prompt", 
                            _promptAnswers[idx]['question'], 
                            _availablePrompts, 
                            (val) => setState(() => _promptAnswers[idx]['question'] = val!)
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline, color: Colors.red),
                          onPressed: () => setState(() => _promptAnswers.removeAt(idx)),
                        ),
                      ],
                    ),
                    TextField(
                      onChanged: (val) => _promptAnswers[idx]['answer'] = val,
                      controller: TextEditingController(text: _promptAnswers[idx]['answer'])..selection = TextSelection.collapsed(offset: _promptAnswers[idx]['answer'].length),
                      decoration: InputDecoration(
                        hintText: "Your answer...",
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(15)),
                      ),
                    ),
                    const SizedBox(height: 15),
                  ],
                );
              }).toList(),

              if (_promptAnswers.length < 3)
                OutlinedButton.icon(
                  onPressed: _addPrompt,
                  icon: const Icon(Icons.add, color: crimson),
                  label: const Text("Add Prompt", style: TextStyle(color: crimson)),
                  style: OutlinedButton.styleFrom(side: const BorderSide(color: crimson)),
                ),
              const SizedBox(height: 10),


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