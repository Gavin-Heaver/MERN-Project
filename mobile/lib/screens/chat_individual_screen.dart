import 'package:flutter/material.dart';
import 'dart:async'; // Required for the refresh timer
import '../services/api_service.dart';

class ChatScreen extends StatefulWidget {
  final String chatName; 
  final String conversationId;
  final String otherUserId;
  final String myUserId;
  final String? photoUrl; // Add this line

  const ChatScreen({
    super.key, 
    required this.chatName, 
    required this.conversationId, 
    required this.otherUserId,
    required this.myUserId,
    this.photoUrl, // Add this line
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  List<dynamic> _messages = [];
  bool _isLoading = true;
  Timer? _refreshTimer; // Timer to check for new messages from the other user

  @override
  void initState() {
    super.initState();
    _fetchMessages();
    // Start a timer to poll for new messages every 3 seconds
    _refreshTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      _fetchMessages(isAutoRefresh: true);
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel(); // Clean up the timer
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchMessages({bool isAutoRefresh = false}) async {
    try {
      final messages = await ApiService.getMessages(widget.conversationId);
      
      // Only update state if the message count has changed to prevent UI flickering
      if (messages.length != _messages.length) {
        if (mounted) {
          setState(() {
            _messages = messages;
            _isLoading = false;
          });
          _scrollToBottom();
        }
      } else if (!isAutoRefresh) {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      print("Error loading messages: $e");
      if (!isAutoRefresh) setState(() => _isLoading = false);
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    // OPTIMISTIC UPDATE: Add the message to the UI immediately
    final temporaryMessage = {
      'text': text,
      'senderId': widget.myUserId,
      'createdAt': DateTime.now().toIso8601String(),
    };

    setState(() {
      _messages.add(temporaryMessage);
    });

    _messageController.clear();
    _scrollToBottom();

    try {
      await ApiService.sendMessage(toUserId: widget.otherUserId, text: text);
      // Sync with server to get the real DB ID/timestamp
      _fetchMessages(isAutoRefresh: true);
    } catch (e) {
      print("Error sending message: $e");
      // Optional: Remove the optimistic message or show an error icon if it fails
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300), 
          curve: Curves.easeOut, 
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    const Color crimson = Color.fromARGB(255, 170, 57, 71);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1, 
        iconTheme: const IconThemeData(color: crimson),
        title: Row( // Changed from a single Text widget to a Row
          children: [
            CircleAvatar( // Displays the primary photo
              radius: 18,
              backgroundColor: Colors.grey[200],
              backgroundImage: widget.photoUrl != null 
                  ? NetworkImage(widget.photoUrl!) 
                  : null,
              child: widget.photoUrl == null 
                  ? const Icon(Icons.person, color: Colors.grey, size: 20) 
                  : null,
            ),
            const SizedBox(width: 12), // Space between photo and name
            Expanded(
              child: Text(
                widget.chatName, 
                style: const TextStyle(color: Colors.black87, fontSize: 18),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator(color: crimson))
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    final message = _messages[index];
                    final isMe = message['senderId'] == widget.myUserId;

                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: isMe ? crimson : Colors.grey[200],
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Text(
                          message['text'] ?? '',
                          style: TextStyle(color: isMe ? Colors.white : Colors.black87),
                        ),
                      ),
                    );
                  },
                ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      filled: true,
                      fillColor: Colors.grey[100],
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(25), borderSide: BorderSide.none),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: crimson),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}