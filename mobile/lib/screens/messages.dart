//Messages

import 'package:flutter/material.dart';
import 'chat_individual_screen.dart';

class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {

    final List<Map<String, dynamic>> activeChats = [
      {
        'name': 'Sam',
        'lastMessage': 'Are you going to the game this weekend?',
        'time': '2m ago',
        'unread': true,
      },
      {
        'name': 'Jamie',
        'lastMessage': 'That sounds awesome, let\'s do it! 🚀',
        'time': '1h ago',
        'unread': false,
      },
      {
        'name': 'Drew',
        'lastMessage': 'Where is the best place to get coffee around campus?',
        'time': 'Yesterday',
        'unread': false,
      },
      {
        'name': 'Avery',
        'lastMessage': 'Haha yeah, that assignment was brutal.',
        'time': 'Tuesday',
        'unread': false,
      },
      {
        'name': 'Avery',
        'lastMessage': 'Haha yeah, that assignment was brutal.',
        'time': 'Tuesday',
        'unread': false,
      },
      {
        'name': 'Sam',
        'lastMessage': 'Are you going to the game this weekend?',
        'time': '2m ago',
        'unread': true,
      },
      {
        'name': 'Jamie',
        'lastMessage': 'That sounds awesome, let\'s do it! 🚀',
        'time': '1h ago',
        'unread': false,
      },
      {
        'name': 'Drew',
        'lastMessage': 'Where is the best place to get coffee around campus?',
        'time': 'Yesterday',
        'unread': false,
      },
      {
        'name': 'Avery',
        'lastMessage': 'Haha yeah, that assignment was brutal.',
        'time': 'Tuesday',
        'unread': false,
      },
      {
        'name': 'Avery',
        'lastMessage': 'Haha yeah, that assignment was brutal.',
        'time': 'Tuesday',
        'unread': false,
      },
    ];

    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset('assets/Logo_V2.png', height: 36, width: 36, fit: BoxFit.contain),
                  SizedBox(width: 8),
                  Text(
                    'Uknighted',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
                ],
              ),
            ),

          // 2. ACTIVE CHATS SECTION (Vertical Scroll)
          // We wrap this in Expanded so it takes up all remaining screen space
          Expanded(
            child: ListView.builder(
              itemCount: activeChats.length,
              itemBuilder: (context, index) {
                final chat = activeChats[index];
                
                // ListTile is a pre-built Flutter widget perfect for chat rows
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 5.0),
                  leading: CircleAvatar(
                    radius: 30,
                    backgroundColor: Colors.grey[200],
                    child: const Icon(Icons.person, size: 35, color: Colors.grey),
                  ),
                  title: Text(
                    chat['name'],
                    style: TextStyle(
                      fontWeight: chat['unread'] ? FontWeight.bold : FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                  subtitle: Text(
                    chat['lastMessage'],
                    maxLines: 1, // Cuts the text off with "..." if it's too long
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: chat['unread'] ? Colors.black87 : Colors.grey[600],
                      fontWeight: chat['unread'] ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        chat['time'],
                        style: TextStyle(
                          color: chat['unread'] ? const Color.fromARGB(255, 170, 57, 71) : Colors.grey[500],
                          fontSize: 12,
                          fontWeight: chat['unread'] ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                      const SizedBox(height: 5),
                      // Only show the red dot if the message is unread
                      if (chat['unread'])
                        Container(
                          width: 10,
                          height: 10,
                          decoration: const BoxDecoration(
                            color: Color.fromARGB(255, 170, 57, 71),
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        // We pass the name of the specific chat they clicked on!
                        builder: (context) => ChatScreen(chatName: chat['name']), 
                      ),
                    );
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