import 'package:flutter/material.dart';
import 'set_preferences.dart';
import '../services/api_service.dart'; // Make sure this path is correct!
 
class BasicInfoScreen extends StatefulWidget {
  const BasicInfoScreen({super.key});

  @override
  State<BasicInfoScreen> createState() => _BasicInfoScreenState();
}

class _BasicInfoScreenState extends State<BasicInfoScreen> {
  // Matches the User.ts Schema exactly
  final TextEditingController _firstNameCtrl = TextEditingController();
  final TextEditingController _lastNameCtrl = TextEditingController();
  final TextEditingController _ageCtrl = TextEditingController();
  
  String _gender = 'Male'; 
  String _classYear = 'Freshman'; 
  String _majorCtrl = 'Computer Science';
  
  String? _error;
  bool _loading = false;

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _ageCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    // 1. Check for empty text fields
    if (_firstNameCtrl.text.trim().isEmpty || 
        _lastNameCtrl.text.trim().isEmpty || 
        _ageCtrl.text.trim().isEmpty) {
      setState(() { _error = "Please fill in all fields."; });
      return;
    }

    // 2. Validate Age (Backend requires min: 18)
    int? age = int.tryParse(_ageCtrl.text.trim());
    if (age == null || age < 18 || age > 99) {
      setState(() { _error = "You must be a valid age (18+) to use UKnighted."; });
      return;
    }

    setState(() { _error = null; _loading = true; });

    try {
      // 3. Send data to MongoDB
      await ApiService.saveBasicInfo(
        firstName: _firstNameCtrl.text.trim(),
        lastName: _lastNameCtrl.text.trim(),
        age: age,
        gender: _gender,
        major: _majorCtrl,
        classYear: _classYear,
      );
      
      // 4. Move to Preferences
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const PreferenceScreen()), 
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
                "Who are you?",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.black),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),
              
              _buildTextField("First Name", _firstNameCtrl),
              const SizedBox(height: 10),
              
              _buildTextField("Last Name", _lastNameCtrl),
              const SizedBox(height: 10),

              _buildNumberField("Age", _ageCtrl),               
              const SizedBox(height: 10),

              _buildDropdown("Gender", _gender, ['Male', 'Female', 'Non-binary', 'Other'], (val) {
                setState(() => _gender = val!);
              }),
              const SizedBox(height: 10),
              
              _buildDropdown("Major", _majorCtrl, ["Accounting","Actuarial Science","Advertising/Public Relations","Aerospace Engineering","Anthropology",
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
              "Religion and Cultural Studies","Risk Management and Insurance","Secondary Education","Social Sciences","Social Work","Sociology","Spanish","Statistics","Theatre","Theatre Studies","Writing and Rhetoric"], (val) {
                setState(() => _majorCtrl = val!);
              }),
              const SizedBox(height: 10),

              _buildDropdown("Class Year", _classYear, ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'], (val) {
                setState(() => _classYear = val!);
              }),
              const SizedBox(height: 20),
              
              // Error Display
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 16), textAlign: TextAlign.center),
                ),
              
              // Submit Button
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color.fromARGB(255, 170, 57, 71),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 55),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                ),
                child: Text(
                  _loading ? 'Saving...' : 'Next, Preferences', 
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
        maxLength: 2, // Age only needs 2 digits!
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