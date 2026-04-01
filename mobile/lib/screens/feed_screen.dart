import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  List<dynamic> _posts = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPosts();
  }

  Future<void> _loadPosts() async {
    try {
      final posts = await ApiService.getPosts();
      setState(() { _posts = posts; });
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      setState(() { _loading = false; });
    }
  }

  Future<void> _logout() async {
    await ApiService.clearToken();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen())
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('UKnighted'),
        actions: [
          IconButton(icon: const Icon(Icons.logout), onPressed: _logout),
        ]
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _error != null
          ? Center(child: Text(_error!))
          : ListView.builder(
            itemCount: _posts.length,
            itemBuilder: (_, i) => ListTile(
              title: Text(_posts[i]['title'] as String),
              subtitle: Text(
                (_posts[i]['author']['basicInfo']?['firstName'] ?? 'Unknown') as String
              ),
            ),
          )
    );
  }
}