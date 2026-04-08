//imports
import 'package:flutter/material.dart';
import '../services/api_service.dart'; 
import '../main.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  //variables
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _workController = TextEditingController(text: "Software Intern");

  String _majorController = 'Computer Science';
  String _heightController = '6\' 2"';
  String _classYear = 'Junior';
  String _gender = 'Male';
  String _sexualOrientation = 'Straight';
  String _datingIntentions = 'Long-term relationship';
  String _religion = 'Agnostic';
  String _politics = 'Moderate';
  final String _age = "21";

  bool _isLoading = true; 
  bool _isSaving = false; 

  //Majors list
  final List<String> _allMajors = [
    "Accounting","Actuarial Science","Advertising/Public Relations","Aerospace Engineering","Anthropology",
    "Architecture","Art","Biology","Biomedical Sciences","Biotechnology","Business Economics","Career and Technical Education","Chemistry",
    "Civil Engineering","Communication","Communication and Conflict","Communication Sciences and Disorders","Computer Engineering","Computer Science",
    "Construction Engineering","Criminal Justice","Data Science","Digital Media","Early Childhood Development and Education","Economics",
    "Electrical Engineering","Elementary Education","Emergency Management","Emerging Media","English","Entertainment Management","Environmental Engineering",
    "Environmental Science","Environmental Studies","Event Management","Exceptional Student Education","Film","Finance","Forensic Science","French and Francophone Studies",
    "General Health Studies","Health Informatics","Health Informatics and Information Management","Health Sciences","History","Hospitality Management",
    "Industrial Engineering","Information Technology","Integrative General Studies","Interdisciplinary Studies","International and Global Studies","Journalism",
    "Latin American, Caribbean and Latinx Studies","Legal Studies","Lifestyle Community Management","Lodging and Restaurant Management","Management","Marketing",
    "Materials Science and Engineering","Mathematics","Mechanical Engineering","Medical Laboratory Sciences","Molecular and Cellular Biology","Molecular Microbiology",
    "Music","Nonprofit Management","Nursing","Philosophy","Photonic Science and Engineering","Physics","Political Science","Psychology","Public Administration","Real Estate",
    "Religion and Cultural Studies","Risk Management and Insurance","Secondary Education","Social Sciences","Social Work","Sociology","Spanish","Statistics","Theatre","Theatre Studies","Writing and Rhetoric"
  ];

  @override
  void initState() {
    super.initState();
    _fetchProfileData();
  }

  //fetching data
  Future<void> _fetchProfileData() async {
    try {
      final userData = await ApiService.getUserProfile();
      
      final basicInfo = userData['basicInfo'] ?? {};

      setState(() {
        _nameController.text = basicInfo['firstName'] ?? '';
        
        String fetchedMajor = basicInfo['major'] ?? 'Computer Science';
        if (_allMajors.contains(fetchedMajor)) {
          _majorController = fetchedMajor;
        }

        _isLoading = false; 
      });
    } catch (e) {
      print("Error loading profile: $e");
      setState(() => _isLoading = false);
    }
  }

  //Api contact
  Future<void> _saveChanges() async {
    setState(() => _isSaving = true);
    try {
      await ApiService.updateProfile(
        Name: _nameController.text.trim(),
        major: _majorController,
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Profile updated successfully!"), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  void _showDeleteConfirmation() {
    // To be worked on
  }

  //dispose
  @override
  void dispose() {
    _nameController.dispose();
    _workController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const Color crimson = Color.fromARGB(255, 170, 57, 71); 

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: _isLoading 
          ? const Center(child: CircularProgressIndicator(color: crimson))
          : SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              //Title
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Uknighted',
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
                    ),
                  ],
                ),
              ),

              //Greeting with name
              Center(
                child: ValueListenableBuilder<TextEditingValue>(
                  valueListenable: _nameController,
                  builder: (context, value, child) {
                    final displayName = value.text.trim().isEmpty ? "Your Name" : value.text.trim();
                    
                    return Text(
                      "Hello, $displayName!", 
                      style: const TextStyle(
                        fontSize: 32, 
                        fontWeight: FontWeight.w900, 
                        color: crimson, 
                        letterSpacing: 1.2,
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 10),

              //Photos
              const Text("My Photos", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              GridView.builder(
                shrinkWrap: true, 
                physics: const NeverScrollableScrollPhysics(), 
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3, 
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 0.75, 
                ),
                itemCount: 6, 
                itemBuilder: (context, index) {
                  return Container(
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(color: Colors.grey[300]!, width: 2),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.add_a_photo, color: Colors.grey),
                      onPressed: () => print("Open Image Picker for slot $index"),
                    ),
                  );
                },
              ),
              const SizedBox(height: 30),

              //Basic info title
              const Text("Basic Info", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: crimson)),
              const Divider(thickness: 1),
              const SizedBox(height: 10),
              
              //Name change box
              _buildTextField("New Name", _nameController),
              
              //Age box (unchangable)
              TextFormField(
                initialValue: _age,
                readOnly: true, 
                decoration: InputDecoration(
                  labelText: "Age (Cannot be changed)",
                  labelStyle: const TextStyle(color: Colors.grey),
                  filled: true,
                  fillColor: Colors.grey[100], 
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),

              //Gender box
              _buildDropdown("Gender", _gender, ['Male', 'Female', 'Non-binary', 'Other'], (val) => setState(() => _gender = val!)),
              
              //Age Box
              _buildDropdown("Sexual Orientation", _sexualOrientation, ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Other'], (val) => setState(() => _sexualOrientation = val!)),
              const SizedBox(height: 10),

              //Background box
              const Text("Background", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: crimson)),
              const Divider(thickness: 1),
              const SizedBox(height: 10),

              //Major box
              _buildDropdown("Major", _majorController, _allMajors, (val) => setState(() => _majorController = val!)),
              //Class year box
              _buildDropdown("Class Year", _classYear, ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad Student'], (val) => setState(() => _classYear = val!)),
              //Work box
              _buildTextField("Work / Job Title", _workController),
              const SizedBox(height: 10),

              const Text("More About Me", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: crimson)),
              const Divider(thickness: 1),
              const SizedBox(height: 10),

              //Height box
              _buildDropdown("Height", _heightController, 
              ['<4', '4\'', '4\' 1"', '4\' 2"', '4\' 3"', '4\' 4"', '4\' 5"', '4\' 6"', '4\' 7"', '4\' 8"', '4\' 9"', '4\' 10"', '4\' 11"', 
              '5\'', '5\' 1"', '5\' 2"', '5\' 3"', '5\' 4"', '5\' 5"', '5\' 6"', '5\' 7"', '5\' 8"', '5\' 9"', '5\' 10"', '5\' 11"',
              '6\'', '6\' 1"', '6\' 2"', '6\' 3"', '6\' 4"', '6\' 5"', '6\' 6"', '>6\' 6"'], (val) => setState(() => _heightController = val!)),
              //Intentions box
              _buildDropdown("Dating Intentions", _datingIntentions, ['Long-term relationship', 'Short-term', 'New friends', 'Figuring it out'], (val) => setState(() => _datingIntentions = val!)),
              //Religion box
              _buildDropdown("Religion", _religion, ['Christian', 'Catholic', 'Jewish', 'Muslim', 'Atheist', 'Agnostic', 'Spiritual', 'Other'], (val) => setState(() => _religion = val!)),
              //Political Alignment box
              _buildDropdown("Political Alignment", _politics, ['Liberal', 'Moderate', 'Conservative', 'Apolitical', 'Other'], (val) => setState(() => _politics = val!)),
              
              const SizedBox(height: 40),

              //Save button
              ElevatedButton(
                onPressed: _isSaving ? null : _saveChanges,
                style: ElevatedButton.styleFrom(
                  backgroundColor: crimson,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 55),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                ),
                child: Text(
                  _isSaving ? 'Saving...' : 'Save Profile', 
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)
                ),
              ),
              const SizedBox(height: 20),

              //log out button
              Center(
                child: OutlinedButton.icon(
                  onPressed: () async {
                    await ApiService.clearToken();

                    if (context.mounted) {
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const TitleScreen(),
                        ),
                        (route) => false,
                      );
                    }
                  },
                  icon: const Icon(Icons.logout, color: Colors.black87),
                  label: const Text(
                    "Log Out",
                    style: TextStyle(
                      fontSize: 16, 
                      fontWeight: FontWeight.bold, 
                      color: Colors.black87
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.black87, width: 2),
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                  ),
                ),
              ),
              const SizedBox(height: 5),

              //Delete account button
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

  //Helper functions
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
          return DropdownMenuItem<String>(
            value: value,
            child: Text(value, overflow: TextOverflow.ellipsis),
          );
        }).toList(),
        onChanged: onChanged,
      ),
    );
  }
}