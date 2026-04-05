//profile
import 'package:flutter/material.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  // --- Controllers for Text Inputs ---
  final TextEditingController _nameController = TextEditingController(text: "Gavin");
  final TextEditingController _majorController = TextEditingController(text: "Computer Science");
  final TextEditingController _workController = TextEditingController(text: "Software Intern");
  
  // --- State Variables for Dropdowns ---
  String _heightController = '6\'2"';
  String _classYear = 'Junior';
  String _gender = 'Male';
  String _attraction = 'Women';
  String _datingIntentions = 'Long-term relationship';
  String _religion = 'Agnostic';
  String _politics = 'Moderate';

  // Constant for Age
  final String _age = "21";

  // --- The Pop-Up Dialog Function ---
  void _showDeleteConfirmation() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.red, size: 28),
              SizedBox(width: 10),
              Text("Delete Account"),
            ],
          ),
          content: const Text(
            "Are you sure you wish to delete? This action can't be undone.",
            style: TextStyle(fontSize: 16),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Closes the pop-up
              },
              child: const Text(
                "No",
                style: TextStyle(color: Colors.grey, fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                // TODO: Send API request to Express/MongoDB to delete user data
                print("ACCOUNT DELETED");
                Navigator.of(context).pop(); // Closes the pop-up
                
                // You would typically route them back to the Title Screen here:
                // Navigator.pushAndRemoveUntil(...) 
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text("Yes"),
            ),
          ],
        );
      },
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _majorController.dispose();
    _workController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const Color crimson = Color.fromARGB(255, 170, 57, 71); // UKnighted Crimson

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset('assets/Logo_V2.png', height: 36, width: 36, fit: BoxFit.contain),
                    SizedBox(width: 8),
                    Text(
                      'Uknighted',
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
                    ),
                  ],
                ),
              ),
              // --- 1. PHOTO GRID ---
              const Text("My Photos", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              GridView.builder(
                shrinkWrap: true, // Crucial when putting a GridView inside a SingleChildScrollView
                physics: const NeverScrollableScrollPhysics(), // Disables grid scrolling so the main page scrolls instead
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3, // 3 photos per row
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 0.75, // Makes the boxes slightly taller than they are wide
                ),
                itemCount: 6, // Standard 6 photo slots
                itemBuilder: (context, index) {
                  return Container(
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(color: Colors.grey[300]!, width: 2),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.add_a_photo, color: Colors.grey),
                      onPressed: () {
                        print("Open Image Picker for slot $index");
                      },
                    ),
                  );
                },
              ),
              const SizedBox(height: 30),

              // --- 2. BASIC INFO ---
              const Text("Basic Info", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: crimson)),
              const Divider(thickness: 1),
              const SizedBox(height: 10),
              
              _buildTextField("Name", _nameController),
              
              // Age Field (Read-Only)
              TextFormField(
                initialValue: _age,
                readOnly: true, // Prevents typing
                decoration: InputDecoration(
                  labelText: "Age (Cannot be changed)",
                  labelStyle: const TextStyle(color: Colors.grey),
                  filled: true,
                  fillColor: Colors.grey[100], // Grey background indicates it's locked
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),

              _buildDropdown("Gender", _gender, ['Male', 'Female', 'Non-binary', 'Other'], (val) => setState(() => _gender = val!)),
              _buildDropdown("Sexual Attraction", _attraction, ['Men', 'Women', 'Everyone'], (val) => setState(() => _attraction = val!)),
              const SizedBox(height: 10),

              // --- 3. UNIVERSITY & WORK ---
              const Text("Background", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: crimson)),
              const Divider(thickness: 1),
              const SizedBox(height: 10),

              _buildTextField("Major", _majorController),
              _buildDropdown("Class Year", _classYear, ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad Student'], (val) => setState(() => _classYear = val!)),
              _buildTextField("Work / Job Title", _workController),
              const SizedBox(height: 10),

              // --- 4. MORE ABOUT ME ---
              const Text("More About Me", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: crimson)),
              const Divider(thickness: 1),
              const SizedBox(height: 10),

              _buildDropdown("Height", _heightController, 
              ['<4', '4\'', '4\' 1"', '4\' 2"', '4\' 3"', '4\' 4"', '4\' 5"', '4\' 6"', '4\' 7"', '4\' 8"', '4\' 9"', '4\' 10"', '4\' 11"', 
              '5\'', '5\' 1"', '5\' 2"', '5\' 3"', '5\' 4"', '5\' 5"', '5\' 6"', '5\' 7"', '5\' 8"', '5\' 9"', '5\' 10"', '5\' 11"',
              '6\'', '6\' 1"', '6\' 2"', '6\' 3"', '6\' 4"', '6\' 5"', '6\' 6"', '>6\' 6"'], (val) => setState(() => _heightController = val!)),
              _buildDropdown("Dating Intentions", _datingIntentions, ['Long-term relationship', 'Short-term', 'New friends', 'Figuring it out'], (val) => setState(() => _datingIntentions = val!)),
              _buildDropdown("Religion", _religion, ['Christian', 'Catholic', 'Jewish', 'Muslim', 'Atheist', 'Agnostic', 'Spiritual', 'Other'], (val) => setState(() => _religion = val!)),
              _buildDropdown("Political Alignment", _politics, ['Liberal', 'Moderate', 'Conservative', 'Apolitical', 'Other'], (val) => setState(() => _politics = val!)),
              
              const SizedBox(height: 40),

              // --- 5. DELETE ACCOUNT BUTTON ---
              Center(
                child: OutlinedButton.icon(
                  onPressed: _showDeleteConfirmation,
                  icon: const Icon(Icons.delete_forever, color: Colors.redAccent),
                  label: const Text(
                    "Delete Account",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.redAccent),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.redAccent, width: 2),
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                  ),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  // ==========================================
  // HELPER FUNCTIONS (Keeps code clean!)
  // ==========================================

  // Helper for generating standard text fields
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

  // Helper for generating dropdown menus
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
        // Maps the list of strings into actual dropdown menu items
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