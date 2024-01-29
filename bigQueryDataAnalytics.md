####
  ``` I have written queries that allow us to analyze our data in various ways. ```
####



1. Daily Active Users (DAU):
    ## This metric can be calculated by counting the distinct number of userId that have entries for each day in the ChatLogs table.

    #standardSQL
    SELECT
      DATE(createdAt) AS date,
      COUNT(DISTINCT userId) AS daily_active_users
    FROM
      `aichatbot21747.ChatLogs`
    GROUP BY
      date
    ORDER BY
      date;


2. Top User Queries 

    ## This query will give us the most common messages users send to the chatbot, which can help you understand the most popular topics or types of questions.

      #standardSQL
    SELECT
      message,
      COUNT(*) as message_count
    FROM
      `aichatbot21747.ChatLogs`
    WHERE
      message IS NOT NULL
    GROUP BY
      message
    ORDER BY
      message_count DESC
    LIMIT
      10;


3. AI Response Analysis

  ## This query will help us see the most common responses given by the AI, which can help you understand what kind of answers the chatbot is most often providing.

  ### #standardSQL
      SELECT
        response,
        COUNT(*) as response_count
      FROM
        `aichatbot21747.ChatLogs`
      WHERE
        response IS NOT NULL
      GROUP BY
        response
      ORDER BY
        response_count DESC
      LIMIT
        10;

4. User-AI Interaction Analysis

   ## To get a more detailed look at the interactions, you might want to see the pairs of user messages and AI responses to understand the context better.

    #standardSQL
  SELECT
    message AS user_message,
    response AS ai_response,
    COUNT(*) as interaction_count
  FROM
    `aichatbot21747.ChatLogs`
  WHERE
    message IS NOT NULL AND response IS NOT NULL
  GROUP BY
    user_message, ai_response
  ORDER BY
    interaction_count DESC
  LIMIT
    10;

5. Keyword Analysis 

  ## Instead of looking for explicit intents, you might analyze the responses for the presence of certain keywords or topics using REGEXP_CONTAINS. For example, if you know certain keywords are associated with specific intents or topics, you can count the occurrences of those keywords.

  #standardSQL
SELECT
  'OrderFood' AS topic,
  COUNT(*) AS count
FROM
  `aichatbot21747.ChatLogs`
WHERE
  REGEXP_CONTAINS(response, r'(?i)\b(order|food|pizza|burger)\b')
UNION ALL
SELECT
  'Booking' AS topic,
  COUNT(*) AS count
FROM
  `aichatbot21747.ChatLogs`
WHERE
  REGEXP_CONTAINS(response, r'(?i)\b(book|reservation|appointment)\b')


6. Data Profiling

  ## Run basic profiling queries to understand the distribution and types of data in your ChatLogs table. For example, checking the most common words or phrases in responses might give you insights into what users are discussing with the chatbot:

  #standardSQL
SELECT
  response,
  COUNT(*) AS count
FROM
  `aichatbot21747.ChatLogs`
GROUP BY
  response
ORDER BY
  count DESC
LIMIT
  10;
