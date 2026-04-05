import 'package:flutter/material.dart';

class ChatScreen extends StatefulWidget {
  final String chatName; // We pass the person's name into this screen

  const ChatScreen({super.key, required this.chatName});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  // Controller to read what the user types in the text box
  final TextEditingController _messageController = TextEditingController();

  final ScrollController _scrollController = ScrollController();
  // Mock data for the conversation. 
  // 'isMe' tells Flutter whether to put the bubble on the left or right.
  final List<Map<String, dynamic>> _messages = [
    {'text': 'Hey! Are you going to the game this weekend?', 'isMe': false},
    {'text': 'I was thinking about it! Do you have tickets?', 'isMe': true},
    {'text': 'Yeah, I have an extra one if you want to come.', 'isMe': false},
  ];

  // Function to add a new message to the list when the user hits "Send"
  void _sendMessage() {
    if (_messageController.text.trim().isNotEmpty) {
      setState(() {
        _messages.add({
          'text': _messageController.text.trim(),
          'isMe': true, 
        });
      });
      
      _messageController.clear();

      // NEW: The Auto-Scroll Logic
      // We wait just 100 milliseconds for the new message to render on screen...
      Future.delayed(const Duration(milliseconds: 100), () {
        // Then we check if the controller is attached to anything...
        if (_scrollController.hasClients) {
          // And animate it to the absolute bottom (maxScrollExtent)
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300), // How fast it scrolls
            curve: Curves.easeOut, // Makes the scroll animation look smooth and natural
          );
        }
      });
    }
  }

  @override
  void dispose() {
    _messageController.dispose(); // Good practice to prevent memory leaks
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      
      // 1. THE TOP APP BAR
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1, // Adds a slight shadow under the bar
        iconTheme: const IconThemeData(color: Color.fromARGB(255, 170, 57, 71)),
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: Colors.grey[200],
              child: const Icon(Icons.person, color: Colors.grey, size: 20),
            ),
            const SizedBox(width: 10),
            Text(
              widget.chatName, // Automatically uses the name passed into the screen
              style: const TextStyle(
                color: Colors.black87,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),

      // 2. THE MAIN BODY
      body: Column(
        children: [
          // Expanded takes up all the space ABOVE the typing area
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                final isMe = message['isMe'];

                // Align pushes the bubble to the right (isMe) or left (!isMe)
                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      // UKnighted Crimson for user, light grey for the other person
                      color: isMe ? const Color.fromARGB(255, 170, 57, 71) : Colors.grey[200],
                      
                      // Rounded corners, but making the "tail" corner sharp looks like a real chat app!
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(20),
                        topRight: const Radius.circular(20),
                        bottomLeft: isMe ? const Radius.circular(20) : const Radius.circular(0),
                        bottomRight: isMe ? const Radius.circular(0) : const Radius.circular(20),
                      ),
                    ),
                    child: Text(
                      message['text'],
                      style: TextStyle(
                        color: isMe ? Colors.white : Colors.black87,
                        fontSize: 16,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // 3. THE TYPING AREA AT THE BOTTOM
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            // SafeArea ensures the text box isn't hidden behind the iPhone home bar
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        hintStyle: TextStyle(color: Colors.grey[500]),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(25),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: Colors.grey[100],
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      ),
                      // Pressing 'Enter' on the keyboard also sends the message
                      onSubmitted: (_) => _sendMessage(), 
                    ),
                  ),
                  const SizedBox(width: 8),
                  
                  // The Send Button
                  Container(
                    decoration: const BoxDecoration(
                      color: Color.fromARGB(255, 170, 57, 71), // UKnighted Crimson
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white, size: 20),
                      onPressed: _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}