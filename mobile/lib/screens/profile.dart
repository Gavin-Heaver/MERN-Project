import 'package:flutter/material.dart';
import '../services/api_service.dart'; 
import '../main.dart'; 

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  // --- Basic Info Controllers ---
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _ageController = TextEditingController();
  final TextEditingController _workController = TextEditingController();

  // --- Profile Controllers (NEW) ---
  final TextEditingController _bioController = TextEditingController();

  // --- Preference Controllers (NEW) ---
  final TextEditingController _ageMinController = TextEditingController();
  final TextEditingController _ageMaxController = TextEditingController();

  // --- Dropdown States (Nullable) ---
  String? _majorController;
  String? _classYear;
  String? _gender;
  String? _datingIntentions;

  final List<String> _interestedInGenders = []; 
  final List<String> _availableGenders = ['Male', 'Female', 'Non-binary', 'Other'];

  bool _isLoading = true; 
  bool _isSaving = false; 

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

  // --- Fetch ALL data on load ---
  Future<void> _fetchProfileData() async {
    try {
      final userData = await ApiService.getUserProfile();
      final userObj = userData['user'] ?? {};
      
      final basicInfo = userObj['basicInfo'] ?? {};
      final profileData = userObj['profile'] ?? {};
      final prefData = userObj['preferences'] ?? {};

      setState(() {
        // 1. Load Basic Info
        _firstNameController.text = basicInfo['firstName'] ?? '';
        _lastNameController.text = basicInfo['lastName'] ?? '';
        if (basicInfo['age'] != null) _ageController.text = basicInfo['age'].toString();

        String? fetchedMajor = basicInfo['major'];
        if (fetchedMajor != null && _allMajors.contains(fetchedMajor)) _majorController = fetchedMajor;
        
        String? fetchedGender = basicInfo['gender'];
        if (fetchedGender != null && ['Male', 'Female', 'Non-binary', 'Other'].contains(fetchedGender)) _gender = fetchedGender;

        String? fetchedClass = basicInfo['classYear'];
        if (fetchedClass != null && ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad Student'].contains(fetchedClass)) _classYear = fetchedClass;

        // 2. Load Profile (Bio)
        _bioController.text = profileData['bio'] ?? '';

        _bioController.text = profileData['bio'] ?? '';
        
        String? fetchedIntentions = profileData['datingIntentions'];
        if (fetchedIntentions != null && ['Long-term relationship', 'Short-term', 'New friends', 'Figuring it out'].contains(fetchedIntentions)) {
          _datingIntentions = fetchedIntentions;
        }

        // 3. Load Preferences
        if (prefData['ageMin'] != null) _ageMinController.text = prefData['ageMin'].toString();
        if (prefData['ageMax'] != null) _ageMaxController.text = prefData['ageMax'].toString();

        // Convert the backend array back into the dropdown string
        _interestedInGenders.clear();
        if (prefData['interestedInGenders'] != null) {
          _interestedInGenders.addAll(List<String>.from(prefData['interestedInGenders']));
        }

        _isLoading = false; 
      });
    } catch (e) {
      print("Error loading profile: $e");
      setState(() => _isLoading = false);
    }
  }

  // --- Save ALL changes ---
  Future<void> _saveChanges() async {
    // Basic Info Validation
    int? parsedAge = int.tryParse(_ageController.text.trim());
    if (parsedAge == null || parsedAge < 18 || parsedAge > 99) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Please enter a valid age (18+)"), backgroundColor: Colors.red));
      return;
    }
    if (_gender == null || _majorController == null || _classYear == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Please fill out Gender, Major, and Class Year."), backgroundColor: Colors.red));
      return;
    }

    // Preferences Validation
    int? minAge = int.tryParse(_ageMinController.text.trim());
    int? maxAge = int.tryParse(_ageMaxController.text.trim());
    if (minAge == null || maxAge == null || minAge < 18 || maxAge > 99 || minAge > maxAge) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Please enter a valid age preference range."), backgroundColor: Colors.red));
      return;
    }
    // Checklist Validation
    if (_interestedInGenders.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Please select at least one gender you are interested in."), backgroundColor: Colors.red));
      return;
    }

    

    setState(() => _isSaving = true);
    
    try {
      // FIRE ALL 3 API CALLS
      await ApiService.saveBasicInfo(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        age: parsedAge,
        gender: _gender!,
        major: _majorController!,
        classYear: _classYear!,
      );

      await ApiService.savePreferences(
        ageMin: minAge,
        ageMax: maxAge,
        interestedInGenders: _interestedInGenders,
      );

      await ApiService.saveProfile(
        bio: _bioController.text.trim(),
        photos: [], 
        datingIntentions: _datingIntentions!, // Passes the dropdown value!
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Everything updated successfully!"), backgroundColor: Colors.green));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red));
    } finally {
      setState(() => _isSaving = false);
    }
  }

  void _showDeleteConfirmation() {
    // To be worked on
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _ageController.dispose();
    _workController.dispose();
    _bioController.dispose();
    _ageMinController.dispose();
    _ageMaxController.dispose();
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

              // Greeting
              Center(
                child: ValueListenableBuilder<TextEditingValue>(
                  valueListenable: _firstNameController,
                  builder: (context, value, child) {
                    final displayName = value.text.trim().isEmpty ? "Your Name" : value.text.trim();
                    return Text(
                      "Hello, $displayName!", 
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: crimson, letterSpacing: 1.2),
                    );
                  },
                ),
              ),
              const SizedBox(height: 10),

              // --- My Photos ---
              const Text("My Photos", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              GridView.builder(
                shrinkWrap: true, 
                physics: const NeverScrollableScrollPhysics(), 
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 0.75, 
                ),
                itemCount: 6, 
                itemBuilder: (context, index) {
                  return Container(
                    decoration: BoxDecoration(
                      color: Colors.grey[200], borderRadius: BorderRadius.circular(15), border: Border.all(color: Colors.grey[300]!, width: 2),
                    ),
                    child: IconButton(icon: const Icon(Icons.add_a_photo, color: Colors.grey), onPressed: () => print("Open Image Picker")),
                  );
                },
              ),
              const SizedBox(height: 30),

              // --- My Bio (Profile) ---
              const Text("My Bio", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: crimson)),
              const Divider(thickness: 1),
              const SizedBox(height: 10),
              _buildTextField("About Me", _bioController, isMultiLine: true),
              const SizedBox(height: 20),

              // --- Preferences ---
              const Text("Who I'm Looking For", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: crimson)),
              const Divider(thickness: 1),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: _buildNumberField("Min Age", _ageMinController)),
                  const SizedBox(width: 10),
                  Expanded(child: _buildNumberField("Max Age", _ageMaxController)),
                ],
              ),
              const Text("Interested In", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87)),
              const SizedBox(height: 8),
              _buildGenderChecklist(),
              const SizedBox(height: 20),

              // --- Basic Info Section ---
              const Text("Basic Info", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: crimson)),
              const Divider(thickness: 1),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: _buildTextField("First Name", _firstNameController)),
                  const SizedBox(width: 10),
                  Expanded(child: _buildTextField("Last Name", _lastNameController)),
                ],
              ),
              _buildNumberField("My Age", _ageController),               
              const SizedBox(height: 10),
              _buildDropdown("Gender", _gender, ['Male', 'Female', 'Non-binary', 'Other'], (val) => setState(() => _gender = val)),
              const SizedBox(height: 20),

              // --- Background Section ---
              const Text("School Info", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: crimson)),
              const Divider(thickness: 1),
              const SizedBox(height: 10),
              _buildDropdown("Major", _majorController, _allMajors, (val) => setState(() => _majorController = val)),
              _buildDropdown("Class Year", _classYear, ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad Student'], (val) => setState(() => _classYear = val)),
              const SizedBox(height: 20),

              // --- More About Me Section ---
              const Text("More About Me", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: crimson)),
              const Divider(thickness: 1),
              const SizedBox(height: 10),
              _buildDropdown("Dating Intentions", _datingIntentions, ['Long-term relationship', 'Short-term', 'New friends', 'Figuring it out'], (val) => setState(() => _datingIntentions = val)),
              
              const SizedBox(height: 40),

              // --- Action Buttons ---
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

              // Log Out & Delete Buttons (Left identical to your previous version)
              Center(
                child: OutlinedButton.icon(
                  onPressed: () async {
                    await ApiService.clearToken();
                    if (context.mounted) {
                      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) => const TitleScreen()), (route) => false);
                    }
                  },
                  icon: const Icon(Icons.logout, color: Colors.black87),
                  label: const Text("Log Out", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.black87, width: 2), padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                  ),
                ),
              ),
              const SizedBox(height: 15), 
              Center(
                child: OutlinedButton.icon(
                  onPressed: _showDeleteConfirmation,
                  icon: const Icon(Icons.delete_forever, color: Colors.redAccent),
                  label: const Text("Delete Account", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.redAccent)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.redAccent, width: 2), padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
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
  // HELPER FUNCTIONS
  // ==========================================
  Widget _buildTextField(String label, TextEditingController controller, {bool isMultiLine = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        controller: controller,
        maxLines: isMultiLine ? 4 : 1,
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

  Widget _buildNumberField(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        controller: controller,
        keyboardType: TextInputType.number,
        maxLength: 2, 
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

  Widget _buildDropdown(String label, String? currentValue, List<String> options, ValueChanged<String?> onChanged) {
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

  Widget _buildGenderChecklist() {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[400]!),
        borderRadius: BorderRadius.circular(15),
      ),
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Column(
        children: _availableGenders.map((gender) {
          return CheckboxListTile(
            title: Text(gender, style: const TextStyle(fontSize: 16)),
            value: _interestedInGenders.contains(gender),
            activeColor: const Color.fromARGB(255, 170, 57, 71),
            controlAffinity: ListTileControlAffinity.leading, 
            dense: true, 
            onChanged: (bool? selected) {
              setState(() {
                if (selected == true) {
                  _interestedInGenders.add(gender);
                } else {
                  _interestedInGenders.remove(gender);
                }
              });
            },
          );
        }).toList(),
      ),
    );
  }
}