const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  if (userInput.trim() === "") {
    return;
  }

  setLoading(true);
  const context = [...messages, { role: "user", content: userInput }];
  setMessages(context);

  // Send chat history to API
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages: context }),
  });

  // Reset user input
  setUserInput("");

  const data = await response.json();

  if (!data) {
    handleError();
    return;
  }

  setMessages((prevMessages) => [
    ...prevMessages,
    { role: "assistant", content: data.result.content },
  ]);
  setLoading(false);

  // Log the result of askToExtractParameters API call
  const extractedParamsResponse = await askToExtractParameters(data.result.content);
  console.log("Extracted Parameters Response:", extractedParamsResponse);
};
