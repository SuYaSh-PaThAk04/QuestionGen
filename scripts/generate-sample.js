/**
 * Run this script to generate a sample question bank Excel file for testing:
 *   node scripts/generate-sample.js
 */
const XLSX = require("xlsx");
const path = require("path");

const data = [
  ["Section", "CO", "Question"],

  // Section A — CO1 (5)
  ["Section A","CO1","Define the term 'algorithm' and explain its significance in computing."],
  ["Section A","CO1","What is the difference between a compiler and an interpreter?"],
  ["Section A","CO1","State and explain the Von Neumann architecture."],
  ["Section A","CO1","Define data types and list the primitive data types in C."],
  ["Section A","CO1","What is an operating system? Explain its primary functions."],
  // Section A — CO2 (5)
  ["Section A","CO2","Explain the concept of recursion with a suitable example."],
  ["Section A","CO2","Describe the working of a stack data structure with push and pop operations."],
  ["Section A","CO2","How does dynamic memory allocation work in C?"],
  ["Section A","CO2","Explain binary search and its time complexity."],
  ["Section A","CO2","Describe the concept of polymorphism in OOP."],
  // Section A — CO3 (3)
  ["Section A","CO3","Compare procedural programming with object-oriented programming."],
  ["Section A","CO3","What are the advantages of using a linked list over an array?"],
  ["Section A","CO3","Distinguish between synchronous and asynchronous programming."],

  // Section B — CO1 (5)
  ["Section B","CO1","Define a database and explain the role of a DBMS."],
  ["Section B","CO1","What is normalization? State its importance."],
  ["Section B","CO1","Define primary key and foreign key with examples."],
  ["Section B","CO1","What is an entity-relationship diagram? Explain its components."],
  ["Section B","CO1","State the ACID properties of database transactions."],
  // Section B — CO2 (5)
  ["Section B","CO2","Write an SQL query to retrieve all records from a student table where CGPA > 8."],
  ["Section B","CO2","Explain JOIN operations in SQL with examples."],
  ["Section B","CO2","How does indexing improve query performance in databases?"],
  ["Section B","CO2","Describe the process of creating and dropping a table in SQL."],
  ["Section B","CO2","Explain transactions and concurrency control in DBMS."],
  // Section B — CO3 (3)
  ["Section B","CO3","Compare SQL and NoSQL databases with suitable examples."],
  ["Section B","CO3","Differentiate between DDL, DML, and DCL commands in SQL."],
  ["Section B","CO3","Analyze the trade-offs between normalization and denormalization."],

  // Section C — CO1 (5)
  ["Section C","CO1","Define a network and classify networks based on their geographical scope."],
  ["Section C","CO1","What is the OSI model? Name its seven layers."],
  ["Section C","CO1","Define IP address and explain IPv4 vs IPv6."],
  ["Section C","CO1","What is a protocol? Name three commonly used network protocols."],
  ["Section C","CO1","Define bandwidth and latency in the context of networking."],
  // Section C — CO2 (5)
  ["Section C","CO2","Explain how the TCP/IP handshake process works."],
  ["Section C","CO2","Describe subnetting and explain how a subnet mask is applied."],
  ["Section C","CO2","How does DNS resolve domain names to IP addresses?"],
  ["Section C","CO2","Explain the role of a router and switch in a network."],
  ["Section C","CO2","What is NAT (Network Address Translation)? Explain with a diagram."],
  // Section C — CO3 (3)
  ["Section C","CO3","Compare circuit switching and packet switching networks."],
  ["Section C","CO3","Differentiate between symmetric and asymmetric encryption."],
  ["Section C","CO3","Analyze the security vulnerabilities in a wireless network."],
];

const ws = XLSX.utils.aoa_to_sheet(data);
ws["!cols"] = [{ wch: 14 }, { wch: 6 }, { wch: 80 }];
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Question Bank");

const outPath = path.join(__dirname, "..", "sample_question_bank.xlsx");
XLSX.writeFile(wb, outPath);
console.log("✓ Sample question bank written to:", outPath);
