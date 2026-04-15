import 'package:flutter/material.dart';
import 'chat_individual_screen.dart';
import '../services/api_service.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List<dynamic> _conversations = [];
  String _myUserId = '';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final profile = await ApiService.getUserProfile();
      _myUserId = profile['user']['_id'];

      final convos = await ApiService.getConversations();

      setState(() {
        _conversations = convos;
        _isLoading = false;
      });
    } catch (e) {
      print("Error loading messages: $e");
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const Color crimson = Color.fromARGB(255, 170, 57, 71);

    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset('assets/Logo_V2.png', height: 36, width: 36, fit: BoxFit.contain),
                const SizedBox(width: 8),
                const Text(
                  'Uknighted',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
                ),
              ],
            ),
          ),

          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator(color: crimson))
              : _conversations.isEmpty
                ? const Center(
                    child: Text(
                      "No matches yet! Keep swiping.",
                      style: TextStyle(color: Colors.grey, fontSize: 16),
                    ),
                  )
                : ListView.builder(
              itemCount: _conversations.length,
              itemBuilder: (context, index) {
                final chat = _conversations[index];
                
                final participants = chat['participantIds'] as List<dynamic>? ?? [];
                final otherUser = participants.firstWhere(
                  (p) => p is Map && p['_id'] != _myUserId, 
                  orElse: () => null
                );
                
                final String firstName = otherUser?['basicInfo']?['firstName'] ?? "UKnighted";
                final String lastName = otherUser?['basicInfo']?['lastName'] ?? "User";
                final String chatName = "$firstName $lastName";
                final String otherUserId = otherUser?['_id'] ?? '';

                // --- PHOTO EXTRACTION LOGIC ---
                final List<dynamic> photos = otherUser?['profile']?['photos'] ?? [];
                final primaryPhoto = photos.firstWhere(
                  (p) => p['isPrimary'] == true, 
                  orElse: () => photos.isNotEmpty ? photos[0] : null
                );
                final String? photoUrl = primaryPhoto?['url'];

                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 5.0),
                  leading: CircleAvatar(
                    radius: 30,
                    backgroundColor: Colors.grey[200],
                    backgroundImage: photoUrl != null ? NetworkImage(photoUrl) : null,
                    child: photoUrl == null ? const Icon(Icons.person, size: 35, color: Colors.grey) : null,
                  ),
                  title: Text(
                    chatName,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                  subtitle: Text(
                    (chat['lastMessagePreview'] != null && chat['lastMessagePreview'].toString().isNotEmpty)
                        ? chat['lastMessagePreview']
                        : 'No messages yet. Start the conversation!',
                    maxLines: 1, 
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                  trailing: chat['lastMessageAt'] != null 
                    ? Text("Active", style: TextStyle(color: Colors.grey[500], fontSize: 12))
                    : null,
                  onTap: () {
                    if (otherUserId.isNotEmpty) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ChatScreen(
                            chatName: chatName,
                            conversationId: chat['_id'],
                            otherUserId: otherUserId,
                            myUserId: _myUserId,
                            photoUrl: photoUrl, // Pass the variable you already defined
                          ), 
                        ),
                      ).then((_) => _fetchData());
                    }
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}