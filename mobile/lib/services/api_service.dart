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
      await saveToken(data['token'] as String);
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
      await saveToken(data['token'] as String);
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
}