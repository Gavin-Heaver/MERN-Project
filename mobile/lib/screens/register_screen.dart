import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'feed_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _displayNameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  String? _error;
  bool _loading = false;

  Future<void> _submit() async {
    setState(() { _error = null; _loading = true; });
    try {
      await ApiService.register(
        email: _emailCtrl.text.trim(),
        password: _passwordCtrl.text
      );
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const FeedScreen())
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
      appBar: AppBar(title: const Text('Create account')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            TextField(
              controller: _displayNameCtrl,
              decoration: const InputDecoration(labelText: 'Display name')
            ),
            TextField(
              controller: _emailCtrl,
              decoration: const InputDecoration(labelText: 'University email'),
              keyboardType: TextInputType.emailAddress
            ),
            TextField(
              controller: _passwordCtrl,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(_error!, style: const TextStyle(color: Colors.red)),
              ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: Text(_loading ? 'Creating account...' : 'Register')
            )
          ],
        )
      )
    );
  }
}