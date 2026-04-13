import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

// Android emulator: http://10.0.2.2:3001/api
// iOS simulator: http://localhost:3001/api
// Production: http://uknighted.onrender.com/api
const String _baseUrl = 'https://uknighted.onrender.com/api';

const _storage = FlutterSecureStorage();

class ApiService {
  static Future<void> saveToken(String token) =>
    _storage.write(key: 'token', value: token);

  static Future<String?> getToken() =>
    _storage.read(key: 'token');
  
  static Future<void> clearToken() =>
    _storage.delete(key: 'token');
  
  static Future<Map<String, String>> _headers() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, dynamic>> register({
    required String email,
    required String password
  }) async {
    final res = await http.post(
      Uri.parse('$_baseUrl/auth/register'),
      headers: await _headers(),
      body: jsonEncode({
        'email': email,
        'password': password
      }),
    );

    if (res.body.isEmpty) throw 'Server returned an empty response';

    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 201) {
      // THE FIX: Safely check for the token instead of forcing a String cast
      final token = data['token'];
      if (token != null) {
        await saveToken(token.toString());
      } else {
        // This will show up in your debug console so you know exactly what the backend sent!
        print("UKNIGHTED API WARNING: Registration successful, but no token was provided in response: $data");
      }
      return data;
    }
    throw data['message'] ?? 'Registration failed';
  }

  static Future<Map<String, dynamic>> login({
    required String email,
    required String password
  }) async {
    final res = await http.post(
      Uri.parse('$_baseUrl/auth/login'),
      headers: await _headers(),
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (res.body.isEmpty) throw 'Server returned an empty response';

    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) {
      // THE FIX: Safe extraction for login as well
      final token = data['token'];
      if (token != null) {
        await saveToken(token.toString());
      } else {
        print("UKNIGHTED API WARNING: Login successful, but no token was provided in response: $data");
      }
      return data;
    }
    throw data['message'] ?? 'Login failed';
  }

  static Future<List<dynamic>> getPosts() async {
    final res = await http.get(
      Uri.parse('$_baseUrl/posts'),
      headers: await _headers()
    );
    if (res.statusCode == 200) return jsonDecode(res.body) as List<dynamic>;
    throw 'Failed to load posts';
  }

  static Future<Map<String, dynamic>> verifyCode({
    required String email, 
    required String code
  }) async {
    
    // 1. ADD THIS PRINT STATEMENT:
    // This lets you verify in your debug console that the email actually made it 
    // from the Register screen to this function successfully!
    print("UKNIGHTED DEBUG - Sending Verification: Email: '$email', Code: '$code'");

    final res = await http.post(
      Uri.parse('$_baseUrl/auth/verify'), 
      headers: await _headers(),
      body: jsonEncode({
        'email': email,
        // 2. CHANGE THE KEY HERE:
        // Try changing 'code' to 'verificationCode'
        // If it still fails, check with your backend team to see if they named it 'verification_code' or 'otp'
        'verificationCode': code 
      }),
    );

    if (res.body.isEmpty) throw 'Server returned an empty response';

    final data = jsonDecode(res.body) as Map<String, dynamic>;
    
    if (res.statusCode == 200) {
      final token = data['token'];
      if (token != null) {
        await saveToken(token.toString());
      }
      return data;
    }
    
    throw data['message'] ?? 'Verification failed. Please check your code and try again.';
  }

  static Future<void> saveBasicInfo({
    required String firstName,
    required String lastName,
    required int age,
    required String gender,
    required String major,
    required String classYear,
  }) async {
    
    // FIX 1: Changed http.put to http.patch
    final res = await http.patch(
      Uri.parse('$_baseUrl/users/basic-info'), 
      headers: await _headers(), 
      body: jsonEncode({
          // FIX 2: Flattened the keys to match exactly what users.ts is looking for
          'firstName': firstName,
          'lastName': lastName,
          'age': age,
          'gender': gender,
          'major': major,
          'classYear': classYear,
      }),
    );

    // Added a safety net to catch any future HTML errors gracefully!
    if (res.statusCode != 200) {
      try {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        throw data['message'] ?? 'Failed to save basic info. Please try again.';
      } catch (e) {
        throw 'Server error: ${res.statusCode}. Check backend console.';
      }
    }
  }

static Future<void> savePreferences({
    required int ageMin,
    required int ageMax,
    required List<String> interestedInGenders,
  }) async {
    final res = await http.patch(
      Uri.parse('$_baseUrl/users/preferences'), 
      headers: await _headers(), 
      body: jsonEncode({
        'ageMin': ageMin,
        'ageMax': ageMax,
        'interestedInGenders': interestedInGenders,
      }),
    );

    if (res.statusCode != 200) {
      try {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        throw data['message'] ?? 'Failed to save preferences.';
      } catch (e) {
        throw 'Server error: ${res.statusCode}. Check backend console.';
      }
    }
  }

 static Future<void> saveProfile({
    required String bio,
    required List<dynamic> photos,
    required String datingIntentions,
  }) async {
    final res = await http.patch(
      Uri.parse('$_baseUrl/users/profile'), 
      headers: await _headers(), 
      body: jsonEncode({
        'bio': bio,
        'photos': photos,
        'datingIntentions': datingIntentions, 
        'promptAnswers': [],// Sends it to the backend!
      }),
    );

    if (res.statusCode != 200) {
      try {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        throw data['message'] ?? 'Failed to save profile.';
      } catch (e) {
        throw 'Server error: ${res.statusCode}. Check backend console.';
      }
    }
  }

  static Future<Map<String, dynamic>> getUserProfile() async {
    final res = await http.get(
      Uri.parse('$_baseUrl/users/me'),
      headers: await _headers(),
    );

    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw 'Failed to load profile data';
  }

  // 2. Update the Name and Major
  static Future<void> updateProfile({required String Name, required String major}) async {
    // We use a PUT request to your /users/me route just like before!
    final res = await http.put(
      Uri.parse('$_baseUrl/users/me'),
      headers: await _headers(),
      body: jsonEncode({
        // Depending on how your backend expects it, it might just be flat, or nested in basicInfo:
        'basicInfo': {
          'displayName': Name,
          'major': major
        }
      }),
    );

    if (res.statusCode != 200) {
      throw 'Failed to update profile.';
    }
  }

  static Future<void> deleteAccount() async {
    final res = await http.delete(
      Uri.parse('$_baseUrl/auth/delete-account'),
      // The backend uses the `authenticate` middleware, so we MUST send the token!
      headers: await _headers(), 
    );

    if (res.statusCode != 200) {
      try {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        throw data['message'] ?? 'Failed to delete account.';
      } catch (e) {
        throw 'Server error: ${res.statusCode}. Check backend console.';
      }
    }
  }

  // ==========================================
  // DISCOVER & INTERACTIONS (SWIPING)
  // ==========================================
  
  static Future<List<dynamic>> getDiscoverUsers() async {
    final res = await http.get(
      Uri.parse('$_baseUrl/users/discover'),
      headers: await _headers()
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body)['users'] as List<dynamic>;
    }
    throw 'Failed to load discover feed';
  }

  static Future<Map<String, dynamic>> sendInteraction({required String toUserId, required String type}) async {
    // type should be 'like' or 'pass'
    final res = await http.post(
      Uri.parse('$_baseUrl/interactions'), // Assumes your interactions.ts is mounted at /api/interactions
      headers: await _headers(),
      body: jsonEncode({'toUserId': toUserId, 'type': type}),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw 'Failed to send swipe action';
  }

  // ==========================================
  // MESSAGES & CONVERSATIONS
  // ==========================================

  static Future<List<dynamic>> getConversations() async {
    // Assumes your messages.ts is mounted at /api/message
    final res = await http.get(
      Uri.parse('$_baseUrl/messages/conversations'),
      headers: await _headers()
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body)['conversations'] as List<dynamic>;
    }
    throw 'Failed to load conversations';
  }

  static Future<List<dynamic>> getMessages(String conversationId) async {
    final res = await http.get(
      Uri.parse('$_baseUrl/messages/$conversationId'),
      headers: await _headers()
    );
    
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      // The backend returns { "conversation": {...}, "messages": [...] }
      // We need to return just the messages list to the ChatScreen
      return data['messages'] as List<dynamic>;
    }
    throw 'Failed to load chat history';
  }
  static Future<void> sendMessage({required String toUserId, required String text}) async {
    final res = await http.post(
      Uri.parse('$_baseUrl/messages/send-msg'),
      headers: await _headers(),
      body: jsonEncode({'toUserId': toUserId, 'text': text}),
    );
    if (res.statusCode != 201 && res.statusCode != 200) {
      throw 'Failed to send message';
    }
  }

  static Future<Map<String, dynamic>> uploadPhoto(String filePath) async {
    final token = await getToken();
    
    // 1. Double check this URL! It MUST end in /users/me/photos
    final request = http.MultipartRequest(
      'POST', 
      Uri.parse('$_baseUrl/users/me/photos') 
    );
    
    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(await http.MultipartFile.fromPath('photo', filePath));

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    // --- THE SAFETY NET ---
    // If the server didn't send JSON back, don't try to decode it!
    if (response.headers['content-type']?.contains('application/json') != true) {
      print("🚨 BACKEND RETURNED HTML ERROR 🚨");
      print("Status Code: ${response.statusCode}");
      // This will print the HTML page to your console so you can read the real error
      print(response.body); 
      throw 'Server crashed or endpoint missing. Check debug console.';
    }

    if (response.statusCode == 201 || response.statusCode == 200) {
      return jsonDecode(response.body); 
    } else {
      final errorData = jsonDecode(response.body);
      throw errorData['message'] ?? 'Photo upload failed';
    }
  }
}