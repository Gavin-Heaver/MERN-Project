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
      
      // Check if the user navigated away while we were waiting for the profile
      if (!mounted) return;
      _myUserId = profile['user']['_id'];

      final convos = await ApiService.getConversations();

      // Check again if the user navigated away while we were waiting for the conversations
      if (!mounted) return;

      setState(() {
        // Applying the filter for "Ghost" conversations as discussed
        _conversations = convos.where((chat) => chat['matchId'] != null).toList();
        _isLoading = false;
      });
    } catch (e) {
      print("Error loading messages: $e");
      
      // Always check mounted before calling setState in a catch block as well
      if (mounted) {
        setState(() => _isLoading = false);
      }
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

                print("UKNIGHTED DEBUG - RAW CHAT: $chat");
                
                // participantIds is now a list of User objects due to backend .populate()
                final participants = chat['participantIds'] as List<dynamic>? ?? [];
                
                // Find the other user who isn't you
                final otherUser = participants.firstWhere(
                  (p) => p is Map && p['_id'] != _myUserId, 
                  orElse: () => null
                );
                
                if (otherUser == null) return const SizedBox.shrink();

                final String firstName = otherUser['basicInfo']?['firstName'] ?? "UKnighted";
                final String lastName = otherUser['basicInfo']?['lastName'] ?? "User";
                final String chatName = "$firstName $lastName";
                final String otherUserId = otherUser['_id'] ?? '';

                // Extract the primary photo URL
                final List<dynamic> photos = otherUser['profile']?['photos'] ?? [];
                final primaryPhoto = photos.firstWhere(
                  (p) => p['isPrimary'] == true, 
                  orElse: () => photos.isNotEmpty ? photos[0] : null
                );
                
                String? photoUrl;
                if (primaryPhoto != null) {
                  photoUrl = primaryPhoto['url'].toString().startsWith('http') 
                      ? primaryPhoto['url'] 
                      : 'https://uknighted.onrender.com${primaryPhoto['url']}';
                }

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
                      
                      // --- THE FIX: Bulletproof ID Extraction ---
                      String extractedMatchId = '';
                      final dynamic matchData = chat['matchId'];
                      
                      if (matchData != null) {
                        if (matchData is Map<String, dynamic>) {
                          // If it's a populated object, grab the _id
                          extractedMatchId = matchData['_id']?.toString() ?? '';
                        } else {
                          // If it's just a raw string ID
                          extractedMatchId = matchData.toString();
                        }
                      }
                      // ------------------------------------------

                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ChatScreen(
                            chatName: chatName,
                            conversationId: chat['_id'],
                            otherUserId: otherUserId,
                            myUserId: _myUserId,
                            photoUrl: photoUrl, 
                            matchId: extractedMatchId, // Pass the clean string
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