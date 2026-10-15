// DevSphere consolidated seed file.
// Run from backend: node seedAll.js
// Safe to run repeatedly: records are upserted by stable slugs/titles.
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });
const User = require("./models/userModel");
const Project = require("./models/Project");
const LibraryProject = require("./models/LibraryProject");
const Mentor = require("./models/Mentor");
const Problem = require("./models/Problem");
const Resource = require("./models/Resource");
const Question = require("./models/Question");
const Roadmap = require("./models/Roadmap");
const Discussion = require("./models/Discussion");

const mentors = [
  {
    "name": "Meera Krishnan",
    "title": "Staff Frontend Engineer",
    "company": "Vercel",
    "expertise": "Frontend Engineering",
    "tags": [
      "React",
      "Performance",
      "Design Systems"
    ],
    "rating": 4.9,
    "sessions": 214,
    "price": "Free",
    "availability": "Available now",
    "bio": "Helps engineers go from 'it works' to 'it scales' — deep dives on rendering performance and component architecture."
  },
  {
    "name": "Rohan Bhatia",
    "title": "Principal Backend Engineer",
    "company": "Razorpay",
    "expertise": "Backend & Systems",
    "tags": [
      "Java",
      "Distributed Systems",
      "API Design"
    ],
    "rating": 4.8,
    "sessions": 176,
    "price": "₹800/session",
    "availability": "Opens this week",
    "bio": "Payments infra veteran. Great for system design mocks and reviewing your service architecture before a big launch."
  },
  {
    "name": "Ananya Deshmukh",
    "title": "Senior Site Reliability Engineer",
    "company": "Google Cloud",
    "expertise": "DevOps & Cloud",
    "tags": [
      "Kubernetes",
      "Observability",
      "Incident Response"
    ],
    "rating": 5,
    "sessions": 98,
    "price": "Free",
    "availability": "Opens this week",
    "bio": "Runs a monthly 'read a real postmortem' session. Sharp on debugging production incidents calmly and methodically."
  },
  {
    "name": "Karthik Subramaniam",
    "title": "Machine Learning Engineer",
    "company": "DeepMind",
    "expertise": "Data & ML",
    "tags": [
      "PyTorch",
      "MLOps",
      "Research"
    ],
    "rating": 4.9,
    "sessions": 143,
    "price": "₹1,200/session",
    "availability": "Available now",
    "bio": "Bridges the gap between research papers and production ML. Good fit if you're moving from tutorials to real projects."
  },
  {
    "name": "Fatima Ansari",
    "title": "Engineering Manager",
    "company": "Stripe",
    "expertise": "Career Coaching",
    "tags": [
      "Promo Packets",
      "1:1s",
      "Leadership"
    ],
    "rating": 4.7,
    "sessions": 261,
    "price": "Free",
    "availability": "Available now",
    "bio": "Ex-IC turned EM. Reviews promo packets, resumes, and helps you figure out what 'senior' actually means at your company."
  },
  {
    "name": "Vikram Rathore",
    "title": "Interview Coach",
    "company": "Ex-Google, Ex-Amazon",
    "expertise": "Interview Prep",
    "tags": [
      "DSA",
      "Mock Interviews",
      "System Design"
    ],
    "rating": 4.9,
    "sessions": 312,
    "price": "₹650/session",
    "availability": "Available now",
    "bio": "Runs full mock loops end-to-end with real interviewer-style feedback, not just 'good job, next question'."
  },
  {
    "name": "Neha Kapoor",
    "title": "Staff Frontend Engineer",
    "company": "Airbnb",
    "expertise": "Frontend Engineering",
    "tags": [
      "Accessibility",
      "React",
      "Testing"
    ],
    "rating": 4.8,
    "sessions": 187,
    "price": "Free",
    "availability": "Currently away",
    "bio": "Accessibility-first frontend engineer. Will happily tear apart your component's keyboard navigation with you."
  },
  {
    "name": "Aditya Menon",
    "title": "Cloud Solutions Architect",
    "company": "AWS",
    "expertise": "DevOps & Cloud",
    "tags": [
      "Terraform",
      "Cost Optimization",
      "AWS"
    ],
    "rating": 4.9,
    "sessions": 152,
    "price": "₹950/session",
    "availability": "Opens this week",
    "bio": "Reviews infra-as-code setups and cloud bills for a living. Can usually spot the one resource that's quietly costing you money."
  }
];
const problems = [
  {
    "slug": "two-sum",
    "number": 1,
    "title": "Two Sum",
    "difficulty": "Easy",
    "tags": [
      "Array",
      "Hash Table"
    ],
    "stats": {
      "likes": "52.4K",
      "dislikes": "1.7K",
      "acceptance": "54.8%"
    },
    "accuracy": "High",
    "statement": [
      {
        "text": "Given an array of integers "
      },
      {
        "code": "nums"
      },
      {
        "text": " and an integer "
      },
      {
        "code": "target"
      },
      {
        "text": ", return indices of the two numbers such that they add up to "
      },
      {
        "code": "target"
      },
      {
        "text": ". You may assume that each input would have "
      },
      {
        "code": "exactly one solution",
        "emphasis": true
      },
      {
        "text": ", and you may not use the same element twice. You can return the answer in any order."
      }
    ],
    "examples": [
      {
        "input": "nums = [2,7,11,15], target = 9",
        "output": "[0,1]",
        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        "input": "nums = [3,2,4], target = 6",
        "output": "[1,2]",
        "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]."
      },
      {
        "input": "nums = [3,3], target = 6",
        "output": "[0,1]"
      }
    ],
    "constraints": [
      {
        "parts": [
          {
            "code": "2 <= nums.length <= 10^4"
          }
        ]
      },
      {
        "parts": [
          {
            "code": "-10^9 <= nums[i] <= 10^9"
          }
        ]
      },
      {
        "parts": [
          {
            "code": "-10^9 <= target <= 10^9"
          }
        ]
      },
      {
        "parts": [
          {
            "code": "Only one valid answer exists."
          }
        ]
      }
    ],
    "hints": [
      {
        "title": "Hint 1 (Brute Force vs Hash Map)",
        "body": [
          {
            "text": "A brute force check of every pair costs "
          },
          {
            "code": "O(n^2)"
          },
          {
            "text": " time. Can you store complement values in a Hash Map for fast lookup?"
          }
        ]
      },
      {
        "title": "Hint 2 (One-pass Hash Map)",
        "body": [
          {
            "text": "For each element "
          },
          {
            "code": "nums[i]"
          },
          {
            "text": ", check if "
          },
          {
            "code": "target - nums[i]"
          },
          {
            "text": " is already in the map. If yes, return current index and stored index. Otherwise insert "
          },
          {
            "code": "nums[i]"
          },
          {
            "text": "."
          }
        ]
      }
    ],
    "editorial": {
      "summary": "Use a Hash Map to store previously seen numbers and their indices for O(n) time complexity.",
      "approach": "1. Create an empty map/dictionary 'seen'.\n2. Iterate through 'nums' with index 'i'.\n3. Compute complement = target - nums[i].\n4. If complement exists in map, return [seen.get(complement), i].\n5. Otherwise, store map[nums[i]] = i.",
      "complexity": "Time: O(n), Space: O(n)"
    },
    "language": "JavaScript",
    "starterCode": "function twoSum(nums, target) {\n  const seen = new Map();\n\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (seen.has(complement)) {\n      return [seen.get(complement), i];\n    }\n    seen.set(nums[i], i);\n  }\n  return [];\n}",
    "testCases": [
      {
        "id": 1,
        "label": "Case 1",
        "paramName": "nums, target",
        "value": "[2,7,11,15], 9",
        "expected": "[0,1]"
      },
      {
        "id": 2,
        "label": "Case 2",
        "paramName": "nums, target",
        "value": "[3,2,4], 6",
        "expected": "[1,2]"
      },
      {
        "id": 3,
        "label": "Case 3",
        "paramName": "nums, target",
        "value": "[3,3], 6",
        "expected": "[0,1]"
      }
    ],
    "submissionsCount": "18,204,113"
  },
  {
    "slug": "valid-parentheses",
    "number": 20,
    "title": "Valid Parentheses",
    "difficulty": "Easy",
    "tags": [
      "Stack",
      "String"
    ],
    "stats": {
      "likes": "24.1K",
      "dislikes": "1.5K",
      "acceptance": "40.7%"
    },
    "accuracy": "Medium",
    "statement": [
      {
        "text": "Given a string "
      },
      {
        "code": "s"
      },
      {
        "text": " containing just the characters "
      },
      {
        "code": "'(', ')', '{', '}', '[' and ']'"
      },
      {
        "text": ", determine if the input string is valid."
      },
      {
        "text": "\nAn input string is valid if open brackets are closed by the same type of brackets and in the correct order."
      }
    ],
    "examples": [
      {
        "input": "s = \"()[]{}\"",
        "output": "true"
      },
      {
        "input": "s = \"(]\"",
        "output": "false"
      },
      {
        "input": "s = \"([)]\"",
        "output": "false"
      }
    ],
    "constraints": [
      {
        "parts": [
          {
            "code": "1 <= s.length <= 10^4"
          }
        ]
      },
      {
        "parts": [
          {
            "code": "s consists only of bracket characters '()[]{}'."
          }
        ]
      }
    ],
    "hints": [
      {
        "title": "Hint 1 (Stack Data Structure)",
        "body": [
          {
            "text": "Use a Stack. Push opening brackets, and when closing bracket appears, check if it matches the "
          },
          {
            "code": "top",
            "emphasis": true
          },
          {
            "text": " element of the stack."
          }
        ]
      }
    ],
    "editorial": {
      "summary": "Process characters sequentially using a LIFO Stack.",
      "approach": "1. Initialize an empty stack array.\n2. For each character char in s:\n   - If char is '(', '{', or '[', push to stack.\n   - Else pop top of stack and check if it matches char's pair.\n3. Return true if stack is empty, else false.",
      "complexity": "Time: O(n), Space: O(n)"
    },
    "language": "JavaScript",
    "starterCode": "function isValid(s) {\n  const pairs = { \")\": \"(\", \"]\": \"[\", \"}\": \"{\" };\n  const stack = [];\n\n  for (const char of s) {\n    if (char in pairs) {\n      if (stack.pop() !== pairs[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}",
    "testCases": [
      {
        "id": 1,
        "label": "Case 1",
        "paramName": "s",
        "value": "\"()[]{}\"",
        "expected": "true"
      },
      {
        "id": 2,
        "label": "Case 2",
        "paramName": "s",
        "value": "\"(]\"",
        "expected": "false"
      },
      {
        "id": 3,
        "label": "Case 3",
        "paramName": "s",
        "value": "\"([)]\"",
        "expected": "false"
      }
    ],
    "submissionsCount": "7,802,441"
  },
  {
    "slug": "palindrome-number",
    "number": 9,
    "title": "Palindrome Number",
    "difficulty": "Easy",
    "tags": [
      "Math"
    ],
    "stats": {
      "likes": "14.2K",
      "dislikes": "2.8K",
      "acceptance": "55.3%"
    },
    "accuracy": "High",
    "statement": [
      {
        "text": "Given an integer "
      },
      {
        "code": "x"
      },
      {
        "text": ", return "
      },
      {
        "code": "true"
      },
      {
        "text": " if "
      },
      {
        "code": "x"
      },
      {
        "text": " is a "
      },
      {
        "code": "palindrome",
        "emphasis": true
      },
      {
        "text": ", and "
      },
      {
        "code": "false"
      },
      {
        "text": " otherwise."
      }
    ],
    "examples": [
      {
        "input": "x = 121",
        "output": "true",
        "explanation": "121 reads as 121 from left to right and from right to left."
      },
      {
        "input": "x = -121",
        "output": "false",
        "explanation": "From left to right it reads -121. From right to left it reads 121-. Therefore it is not a palindrome."
      },
      {
        "input": "x = 10",
        "output": "false",
        "explanation": "Reads 01 from right to left."
      }
    ],
    "constraints": [
      {
        "parts": [
          {
            "code": "-2^31 <= x <= 2^31 - 1"
          }
        ]
      }
    ],
    "hints": [
      {
        "title": "Hint 1 (Without String Conversion)",
        "body": [
          {
            "text": "Negative numbers are never palindromes because of the minus sign. You can reverse half of the digits to avoid integer overflow!"
          }
        ]
      }
    ],
    "editorial": {
      "summary": "Reverse the integer mathematically or convert to string for twin pointer comparison.",
      "approach": "1. Negative numbers return false.\n2. If x % 10 === 0 and x !== 0, return false.\n3. Reconstruct reversed number by continuously taking x % 10 and dividing x by 10.\n4. Compare reversed number with x.",
      "complexity": "Time: O(log10(n)), Space: O(1)"
    },
    "language": "JavaScript",
    "starterCode": "function isPalindrome(x) {\n  if (x < 0) return false;\n  const str = String(x);\n  return str === str.split('').reverse().join('');\n}",
    "testCases": [
      {
        "id": 1,
        "label": "Case 1",
        "paramName": "x",
        "value": "121",
        "expected": "true"
      },
      {
        "id": 2,
        "label": "Case 2",
        "paramName": "x",
        "value": "-121",
        "expected": "false"
      },
      {
        "id": 3,
        "label": "Case 3",
        "paramName": "x",
        "value": "10",
        "expected": "false"
      }
    ],
    "submissionsCount": "5,410,290"
  },
  {
    "slug": "best-time-to-buy-and-sell-stock",
    "number": 121,
    "title": "Best Time to Buy and Sell Stock",
    "difficulty": "Easy",
    "tags": [
      "Array",
      "Dynamic Programming"
    ],
    "stats": {
      "likes": "30.1K",
      "dislikes": "1.1K",
      "acceptance": "54.1%"
    },
    "accuracy": "High",
    "statement": [
      {
        "text": "You are given an array "
      },
      {
        "code": "prices"
      },
      {
        "text": " where "
      },
      {
        "code": "prices[i]"
      },
      {
        "text": " is the price of a given stock on the "
      },
      {
        "code": "i-th"
      },
      {
        "text": " day."
      },
      {
        "text": "\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock."
      }
    ],
    "examples": [
      {
        "input": "prices = [7,1,5,3,6,4]",
        "output": "5",
        "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
      },
      {
        "input": "prices = [7,6,4,3,1]",
        "output": "0",
        "explanation": "In this case, no transactions are done and max profit = 0."
      }
    ],
    "constraints": [
      {
        "parts": [
          {
            "code": "1 <= prices.length <= 10^5"
          }
        ]
      },
      {
        "parts": [
          {
            "code": "0 <= prices[i] <= 10^4"
          }
        ]
      }
    ],
    "hints": [
      {
        "title": "Hint 1 (Track Minimum Price)",
        "body": [
          {
            "text": "Track the minimum buy price seen so far as you iterate through the prices list."
          }
        ]
      }
    ],
    "editorial": {
      "summary": "Single pass tracking minPrice and maxProfit.",
      "approach": "1. Initialize minPrice = Infinity and maxProfit = 0.\n2. Iterate price in prices:\n   - minPrice = Math.min(minPrice, price)\n   - maxProfit = Math.max(maxProfit, price - minPrice)\n3. Return maxProfit.",
      "complexity": "Time: O(n), Space: O(1)"
    },
    "language": "JavaScript",
    "starterCode": "function maxProfit(prices) {\n  let minPrice = Infinity;\n  let maxProfit = 0;\n\n  for (let i = 0; i < prices.length; i++) {\n    if (prices[i] < minPrice) {\n      minPrice = prices[i];\n    } else if (prices[i] - minPrice > maxProfit) {\n      maxProfit = prices[i] - minPrice;\n    }\n  }\n  return maxProfit;\n}",
    "testCases": [
      {
        "id": 1,
        "label": "Case 1",
        "paramName": "prices",
        "value": "[7,1,5,3,6,4]",
        "expected": "5"
      },
      {
        "id": 2,
        "label": "Case 2",
        "paramName": "prices",
        "value": "[7,6,4,3,1]",
        "expected": "0"
      }
    ],
    "submissionsCount": "6,920,441"
  },
  {
    "slug": "longest-substring-without-repeating",
    "number": 3,
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "tags": [
      "Hash Table",
      "String",
      "Sliding Window"
    ],
    "stats": {
      "likes": "38.5K",
      "dislikes": "1.6K",
      "acceptance": "34.2%"
    },
    "accuracy": "Medium",
    "statement": [
      {
        "text": "Given a string "
      },
      {
        "code": "s"
      },
      {
        "text": ", find the length of the "
      },
      {
        "code": "longest substring",
        "emphasis": true
      },
      {
        "text": " without repeating characters."
      }
    ],
    "examples": [
      {
        "input": "s = \"abcabcbb\"",
        "output": "3",
        "explanation": "The answer is \"abc\", with length 3."
      },
      {
        "input": "s = \"bbbbb\"",
        "output": "1",
        "explanation": "The answer is \"b\", with length 1."
      },
      {
        "input": "s = \"pwwkew\"",
        "output": "3",
        "explanation": "The answer is \"wke\", with length 3."
      }
    ],
    "constraints": [
      {
        "parts": [
          {
            "code": "0 <= s.length <= 5 * 10^4"
          }
        ]
      },
      {
        "parts": [
          {
            "code": "s consists of English letters, digits, symbols and spaces."
          }
        ]
      }
    ],
    "hints": [
      {
        "title": "Hint 1 (Sliding Window)",
        "body": [
          {
            "text": "Maintain a window [left, right] of unique characters using a Map of last seen indices."
          }
        ]
      }
    ],
    "editorial": {
      "summary": "Sliding Window technique using Hash Map.",
      "approach": "1. Keep left pointer at 0 and map for character last positions.\n2. Expand right pointer from 0 to s.length - 1.\n3. If character s[right] seen at index >= left, shift left = lastSeen + 1.\n4. Calculate max length = Math.max(max, right - left + 1).",
      "complexity": "Time: O(n), Space: O(min(m, n))"
    },
    "language": "JavaScript",
    "starterCode": "function lengthOfLongestSubstring(s) {\n  const lastSeen = new Map();\n  let left = 0, maxLen = 0;\n\n  for (let right = 0; right < s.length; right++) {\n    const ch = s[right];\n    if (lastSeen.has(ch) && lastSeen.get(ch) >= left) {\n      left = lastSeen.get(ch) + 1;\n    }\n    lastSeen.set(ch, right);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}",
    "testCases": [
      {
        "id": 1,
        "label": "Case 1",
        "paramName": "s",
        "value": "\"abcabcbb\"",
        "expected": "3"
      },
      {
        "id": 2,
        "label": "Case 2",
        "paramName": "s",
        "value": "\"bbbbb\"",
        "expected": "1"
      },
      {
        "id": 3,
        "label": "Case 3",
        "paramName": "s",
        "value": "\"pwwkew\"",
        "expected": "3"
      }
    ],
    "submissionsCount": "9,331,502"
  },
  {
    "slug": "merge-intervals",
    "number": 56,
    "title": "Merge Intervals",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Sorting"
    ],
    "stats": {
      "likes": "22.8K",
      "dislikes": "710",
      "acceptance": "47.1%"
    },
    "accuracy": "Medium",
    "statement": [
      {
        "text": "Given an array of "
      },
      {
        "code": "intervals"
      },
      {
        "text": " where "
      },
      {
        "code": "intervals[i] = [starti, endi]"
      },
      {
        "text": ", merge all overlapping intervals and return an array of non-overlapping intervals."
      }
    ],
    "examples": [
      {
        "input": "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        "output": "[[1,6],[8,10],[15,18]]"
      },
      {
        "input": "intervals = [[1,4],[4,5]]",
        "output": "[[1,5]]"
      }
    ],
    "constraints": [
      {
        "parts": [
          {
            "code": "1 <= intervals.length <= 10^4"
          }
        ]
      },
      {
        "parts": [
          {
            "code": "intervals[i].length == 2"
          }
        ]
      }
    ],
    "hints": [
      {
        "title": "Hint 1 (Sort first)",
        "body": [
          {
            "text": "Sorting the intervals by start time allows simple left-to-right linear merging."
          }
        ]
      }
    ],
    "editorial": {
      "summary": "Sort intervals by start time, then merge continuously.",
      "approach": "1. Sort intervals by start value.\n2. Push first interval to output.\n3. For each subsequent interval [s, e]:\n   - If s <= lastEnd, merge: lastEnd = Math.max(lastEnd, e).\n   - Else push new interval.",
      "complexity": "Time: O(n log n), Space: O(n)"
    },
    "language": "JavaScript",
    "starterCode": "function merge(intervals) {\n  if (!intervals.length) return [];\n  intervals.sort((a, b) => a[0] - b[0]);\n\n  const result = [intervals[0]];\n\n  for (let i = 1; i < intervals.length; i++) {\n    const last = result[result.length - 1];\n    const curr = intervals[i];\n\n    if (curr[0] <= last[1]) {\n      last[1] = Math.max(last[1], curr[1]);\n    } else {\n      result.push(curr);\n    }\n  }\n  return result;\n}",
    "testCases": [
      {
        "id": 1,
        "label": "Case 1",
        "paramName": "intervals",
        "value": "[[1,3],[2,6],[8,10],[15,18]]",
        "expected": "[[1,6],[8,10],[15,18]]"
      },
      {
        "id": 2,
        "label": "Case 2",
        "paramName": "intervals",
        "value": "[[1,4],[4,5]]",
        "expected": "[[1,5]]"
      }
    ],
    "submissionsCount": "3,187,120"
  },
  {
    "slug": "3sum",
    "number": 15,
    "title": "3Sum",
    "difficulty": "Medium",
    "tags": [
      "Two Pointers",
      "Array",
      "Sorting"
    ],
    "stats": {
      "likes": "31.2K",
      "dislikes": "2.8K",
      "acceptance": "35.1%"
    },
    "accuracy": "Medium",
    "statement": [
      {
        "text": "Given an integer array "
      },
      {
        "code": "nums"
      },
      {
        "text": ", return all the triplets "
      },
      {
        "code": "[nums[i], nums[j], nums[k]]"
      },
      {
        "text": " such that "
      },
      {
        "code": "i != j, i != k, j != k"
      },
      {
        "text": " and "
      },
      {
        "code": "nums[i] + nums[j] + nums[k] == 0"
      },
      {
        "text": ". The solution set must not contain duplicate triplets."
      }
    ],
    "examples": [
      {
        "input": "nums = [-1,0,1,2,-1,-4]",
        "output": "[[-1,-1,2],[-1,0,1]]"
      },
      {
        "input": "nums = [0,1,1]",
        "output": "[]"
      },
      {
        "input": "nums = [0,0,0]",
        "output": "[[0,0,0]]"
      }
    ],
    "constraints": [
      {
        "parts": [
          {
            "code": "3 <= nums.length <= 3000"
          }
        ]
      },
      {
        "parts": [
          {
            "code": "-10^5 <= nums[i] <= 10^5"
          }
        ]
      }
    ],
    "hints": [
      {
        "title": "Hint 1 (Sort and Two Pointers)",
        "body": [
          {
            "text": "Sort the array, iterate for fixed element i, and use two pointers (left, right) to find pairs adding up to -nums[i]."
          }
        ]
      }
    ],
    "editorial": {
      "summary": "Sort array and use two pointers to find sum = 0 without duplicate triplets.",
      "approach": "1. Sort nums ascending.\n2. Loop i from 0 to n-3. Skip duplicates if nums[i] == nums[i-1].\n3. Set left = i+1, right = n-1.\n4. If sum < 0 move left++, if sum > 0 move right--, if sum == 0 record triplet and skip duplicate left/right.",
      "complexity": "Time: O(n^2), Space: O(1)"
    },
    "language": "JavaScript",
    "starterCode": "function threeSum(nums) {\n  nums.sort((a, b) => a - b);\n  const result = [];\n\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n\n    let left = i + 1;\n    let right = nums.length - 1;\n\n    while (left < right) {\n      const sum = nums[i] + nums[left] + nums[right];\n      if (sum === 0) {\n        result.push([nums[i], nums[left], nums[right]]);\n        while (left < right && nums[left] === nums[left + 1]) left++;\n        while (left < right && nums[right] === nums[right - 1]) right--;\n        left++;\n        right--;\n      } else if (sum < 0) {\n        left++;\n      } else {\n        right--;\n      }\n    }\n  }\n  return result;\n}",
    "testCases": [
      {
        "id": 1,
        "label": "Case 1",
        "paramName": "nums",
        "value": "[-1,0,1,2,-1,-4]",
        "expected": "[[-1,-1,2],[-1,0,1]]"
      },
      {
        "id": 2,
        "label": "Case 2",
        "paramName": "nums",
        "value": "[0,1,1]",
        "expected": "[]"
      },
      {
        "id": 3,
        "label": "Case 3",
        "paramName": "nums",
        "value": "[0,0,0]",
        "expected": "[[0,0,0]]"
      }
    ],
    "submissionsCount": "5,120,400"
  },
  {
    "slug": "trapping-rain-water",
    "number": 42,
    "title": "Trapping Rain Water",
    "difficulty": "Hard",
    "tags": [
      "Two Pointers",
      "Monotonic Stack",
      "DP"
    ],
    "stats": {
      "likes": "36.2K",
      "dislikes": "430",
      "acceptance": "61.4%"
    },
    "accuracy": "High",
    "statement": [
      {
        "text": "Given "
      },
      {
        "code": "n"
      },
      {
        "text": " non-negative integers representing an elevation map where the width of each bar is "
      },
      {
        "code": "1"
      },
      {
        "text": ", compute how much water it can trap after raining."
      }
    ],
    "elevation": [
      0,
      1,
      0,
      2,
      1,
      0,
      1,
      3,
      2,
      1,
      2,
      1
    ],
    "examples": [
      {
        "input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        "output": "6",
        "explanation": "The elevation map [0,1,0,2,1,0,1,3,2,1,2,1] traps 6 units of rain water."
      },
      {
        "input": "height = [4,2,0,3,2,5]",
        "output": "9"
      }
    ],
    "constraints": [
      {
        "parts": [
          {
            "code": "n == height.length"
          }
        ]
      },
      {
        "parts": [
          {
            "code": "1 <= n <= 2 * 10^4"
          }
        ]
      },
      {
        "parts": [
          {
            "code": "0 <= height[i] <= 10^5"
          }
        ]
      }
    ],
    "hints": [
      {
        "title": "Hint 1 (Two Pointers)",
        "body": [
          {
            "text": "Use left and right pointers. Water trapped at position is bounded by min(leftMax, rightMax) - height[i]."
          }
        ]
      }
    ],
    "editorial": {
      "summary": "Two pointers algorithm with O(1) space complexity.",
      "approach": "1. Initialize left = 0, right = n-1, leftMax = 0, rightMax = 0, total = 0.\n2. While left < right:\n   - If height[left] < height[right]:\n     - leftMax = Math.max(leftMax, height[left])\n     - total += leftMax - height[left], then left++\n   - Else:\n     - rightMax = Math.max(rightMax, height[right])\n     - total += rightMax - height[right], then right--\n3. Return total.",
      "complexity": "Time: O(n), Space: O(1)"
    },
    "language": "JavaScript",
    "starterCode": "function trap(height) {\n  let left = 0, right = height.length - 1;\n  let leftMax = 0, rightMax = 0;\n  let totalWater = 0;\n\n  while (left < right) {\n    if (height[left] < height[right]) {\n      if (height[left] >= leftMax) {\n        leftMax = height[left];\n      } else {\n        totalWater += leftMax - height[left];\n      }\n      left++;\n    } else {\n      if (height[right] >= rightMax) {\n        rightMax = height[right];\n      } else {\n        totalWater += rightMax - height[right];\n      }\n      right--;\n    }\n  }\n  return totalWater;\n}",
    "testCases": [
      {
        "id": 1,
        "label": "Case 1",
        "paramName": "height",
        "value": "[0,1,0,2,1,0,1,3,2,1,2,1]",
        "expected": "6"
      },
      {
        "id": 2,
        "label": "Case 2",
        "paramName": "height",
        "value": "[4,2,0,3,2,5]",
        "expected": "9"
      }
    ],
    "submissionsCount": "2,340,892"
  },
  {
    "slug": "median-of-two-sorted-arrays",
    "number": 4,
    "title": "Median of Two Sorted Arrays",
    "difficulty": "Hard",
    "tags": [
      "Array",
      "Binary Search",
      "Divide and Conquer"
    ],
    "stats": {
      "likes": "28.4K",
      "dislikes": "3.1K",
      "acceptance": "38.6%"
    },
    "accuracy": "High",
    "statement": [
      {
        "text": "Given two sorted arrays "
      },
      {
        "code": "nums1"
      },
      {
        "text": " and "
      },
      {
        "code": "nums2"
      },
      {
        "text": " of size "
      },
      {
        "code": "m"
      },
      {
        "text": " and "
      },
      {
        "code": "n"
      },
      {
        "text": " respectively, return the median of the two sorted arrays."
      },
      {
        "text": "\nThe overall run time complexity should be "
      },
      {
        "code": "O(log (m+n))",
        "emphasis": true
      },
      {
        "text": "."
      }
    ],
    "examples": [
      {
        "input": "nums1 = [1,3], nums2 = [2]",
        "output": "2.00000",
        "explanation": "merged array = [1,2,3] and median is 2."
      },
      {
        "input": "nums1 = [1,2], nums2 = [3,4]",
        "output": "2.50000",
        "explanation": "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5."
      }
    ],
    "constraints": [
      {
        "parts": [
          {
            "code": "0 <= m, n <= 1000"
          }
        ]
      },
      {
        "parts": [
          {
            "code": "1 <= m + n <= 2000"
          }
        ]
      }
    ],
    "hints": [
      {
        "title": "Hint 1 (Binary Search Partition)",
        "body": [
          {
            "text": "Binary search on the smaller array to find a partition point where maxLeft1 <= minRight2 and maxLeft2 <= minRight1."
          }
        ]
      }
    ],
    "editorial": {
      "summary": "Binary search on smaller array partition.",
      "approach": "1. Ensure nums1 is smaller array.\n2. Binary search partition index i in nums1 and j in nums2.\n3. Check boundary values maxLeft1, minRight1, maxLeft2, minRight2.\n4. Calculate median based on even/odd total length.",
      "complexity": "Time: O(log(min(m,n))), Space: O(1)"
    },
    "language": "JavaScript",
    "starterCode": "function findMedianSortedArrays(nums1, nums2) {\n  const merged = [...nums1, ...nums2].sort((a, b) => a - b);\n  const mid = Math.floor(merged.length / 2);\n  if (merged.length % 2 === 0) {\n    return (merged[mid - 1] + merged[mid]) / 2;\n  }\n  return merged[mid];\n}",
    "testCases": [
      {
        "id": 1,
        "label": "Case 1",
        "paramName": "nums1, nums2",
        "value": "[1,3], [2]",
        "expected": "2"
      },
      {
        "id": 2,
        "label": "Case 2",
        "paramName": "nums1, nums2",
        "value": "[1,2], [3,4]",
        "expected": "2.5"
      }
    ],
    "submissionsCount": "4,120,000"
  },
  {
    "slug": "edit-distance",
    "number": 72,
    "title": "Edit Distance",
    "difficulty": "Hard",
    "tags": [
      "String",
      "Dynamic Programming"
    ],
    "stats": {
      "likes": "15.9K",
      "dislikes": "240",
      "acceptance": "55.8%"
    },
    "accuracy": "Medium",
    "statement": [
      {
        "text": "Given two strings "
      },
      {
        "code": "word1"
      },
      {
        "text": " and "
      },
      {
        "code": "word2"
      },
      {
        "text": ", return the minimum number of operations required to convert "
      },
      {
        "code": "word1"
      },
      {
        "text": " to "
      },
      {
        "code": "word2"
      },
      {
        "text": "."
      },
      {
        "text": "\nYou have 3 operations permitted: Insert a character, Delete a character, Replace a character."
      }
    ],
    "examples": [
      {
        "input": "word1 = \"horse\", word2 = \"ros\"",
        "output": "3",
        "explanation": "horse -> rorse (replace 'h' with 'r') -> rose (remove 'r') -> ros (remove 'e')"
      },
      {
        "input": "word1 = \"intention\", word2 = \"execution\"",
        "output": "5"
      }
    ],
    "constraints": [
      {
        "parts": [
          {
            "code": "0 <= word1.length, word2.length <= 500"
          }
        ]
      }
    ],
    "hints": [
      {
        "title": "Hint 1 (2D Dynamic Programming Table)",
        "body": [
          {
            "text": "dp[i][j] stores minimum edit distance between word1[0...i-1] and word2[0...j-1]."
          }
        ]
      }
    ],
    "editorial": {
      "summary": "2D Dynamic Programming matrix solution.",
      "approach": "1. Initialize DP matrix of size (m+1) x (n+1).\n2. Base cases dp[i][0] = i and dp[0][j] = j.\n3. For i 1..m and j 1..n:\n   - If word1[i-1] == word2[j-1]: dp[i][j] = dp[i-1][j-1]\n   - Else: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])\n4. Return dp[m][n].",
      "complexity": "Time: O(m * n), Space: O(m * n)"
    },
    "language": "JavaScript",
    "starterCode": "function minDistance(word1, word2) {\n  const m = word1.length;\n  const n = word2.length;\n  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n\n  for (let i = 0; i <= m; i++) dp[i][0] = i;\n  for (let j = 0; j <= n; j++) dp[0][j] = j;\n\n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (word1[i - 1] === word2[j - 1]) {\n        dp[i][j] = dp[i - 1][j - 1];\n      } else {\n        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);\n      }\n    }\n  }\n  return dp[m][n];\n}",
    "testCases": [
      {
        "id": 1,
        "label": "Case 1",
        "paramName": "word1, word2",
        "value": "\"horse\", \"ros\"",
        "expected": "3"
      },
      {
        "id": 2,
        "label": "Case 2",
        "paramName": "word1, word2",
        "value": "\"intention\", \"execution\"",
        "expected": "5"
      }
    ],
    "submissionsCount": "1,890,300"
  }
];
const projects = [
  {
    "title": "HyperPulse: Real-Time Telemetry Sandbox",
    "description": "Distributed event stream visualizer designed to trace microsecond anomalies across Kubernetes pods using eBPF and WebSockets.",
    "techStack": [
      "Go",
      "eBPF",
      "Kubernetes",
      "Next.js",
      "ClickHouse"
    ],
    "difficulty": "Advanced",
    "status": {
      "label": "Alpha Testing",
      "variant": "warning",
      "stage": "Alpha Testing"
    },
    "leadName": "@sarah_infra",
    "memberNames": [
      "Sarah Kim",
      "Devon Park",
      "Mira Lang"
    ],
    "openPositions": [
      {
        "role": "Go Backend Engineer",
        "slots": "1 slot"
      },
      {
        "role": "eBPF Specialist",
        "slots": "1 slot"
      }
    ],
    "progress": {
      "label": "Sprint 4 · 12/18 tasks done",
      "percent": 66,
      "icon": "clock",
      "barVariant": "primary"
    },
    "version": null
  },
  {
    "title": "NeuralDocs: Local RAG Search for Monorepos",
    "description": "High-performance CLI and web dashboard to vector-index proprietary repos locally via Ollama with zero token leakage.",
    "techStack": [
      "Rust",
      "Python",
      "React",
      "LanceDB",
      "Tailwind"
    ],
    "difficulty": "Intermediate",
    "status": {
      "label": "MVP Stage · 3 Weeks Left",
      "variant": "success",
      "stage": "MVP in Progress"
    },
    "leadName": "@arjun_ai",
    "memberNames": [
      "Arjun Iyer",
      "Lena Fischer",
      "Theo Brandt"
    ],
    "openPositions": [
      {
        "role": "Rust Engineer",
        "slots": "1 slot"
      },
      {
        "role": "React / UI Specialist",
        "slots": "1 slot"
      }
    ],
    "progress": {
      "label": "Milestone 2 · Auth & Vector Store done",
      "percent": 50,
      "icon": "check",
      "barVariant": "success"
    },
    "version": null
  },
  {
    "title": "DevDeck: Open-Source Keyboard Layout Studio",
    "description": "Web-based configurator for mechanical keyboard custom layouts, flashing QMK/VIA firmware directly via WebHID API.",
    "techStack": [
      "TypeScript",
      "WebHID",
      "Tailwind",
      "Canvas API"
    ],
    "difficulty": "Beginner Friendly",
    "status": {
      "label": "Ideation & Planning",
      "variant": "default",
      "stage": "Ideation"
    },
    "leadName": "@mads_dev",
    "memberNames": [
      "Mads Holm",
      "Ines Costa"
    ],
    "openPositions": [
      {
        "role": "Tailwind CSS Specialist",
        "slots": "1 slot"
      },
      {
        "role": "QA & Manual Tester",
        "slots": "2 slots"
      }
    ],
    "progress": {
      "label": "RFC Stage",
      "percent": 15,
      "icon": "doc",
      "barVariant": "primary"
    },
    "version": null
  },
  {
    "title": "OpenDev Microservices Platform",
    "description": "Production-ready boilerplate for multi-tenant microservices with authentication, gRPC communication, and OpenTelemetry instrumentation.",
    "techStack": [
      "Go",
      "gRPC",
      "PostgreSQL",
      "Docker"
    ],
    "difficulty": "Advanced",
    "status": {
      "label": "Production v1.0",
      "variant": "solid",
      "stage": "Production"
    },
    "leadName": "Alex Chen",
    "memberNames": [
      "Alex Chen",
      "Priya Nair",
      "Sam Osei"
    ],
    "openPositions": [
      {
        "role": "DevOps Engineer",
        "slots": "1 slot"
      }
    ],
    "progress": {
      "label": "Active member · 2 PRs pending",
      "percent": 100,
      "icon": "commit",
      "barVariant": "primary"
    },
    "version": "v1.0.4"
  },
  {
    "title": "CodeReview-AI: Autonomous PR Review Bot",
    "description": "GitHub App that runs static analysis, summarizes PR changes, and provides actionable inline refactoring suggestions.",
    "techStack": [
      "TypeScript",
      "OpenAI API",
      "GitHub Octokit",
      "PostgreSQL"
    ],
    "difficulty": "Intermediate",
    "status": {
      "label": "In Development",
      "variant": "neutral",
      "stage": "MVP in Progress"
    },
    "leadName": "@dev_kelsey",
    "memberNames": [
      "Kelsey Wren",
      "Omar Farouk",
      "Yuki Tanaka"
    ],
    "openPositions": [
      {
        "role": "Backend Node.js",
        "slots": "1 slot"
      }
    ],
    "progress": {
      "label": "Core parser 85% covered",
      "percent": 42,
      "icon": "trend",
      "barVariant": "secondary"
    },
    "version": null
  },
  {
    "title": "AlgoArena: Real-Time Peer Code Duel Platform",
    "description": "1v1 competitive programming arena with synchronized Monaco editor instances and WebRTC audio rooms.",
    "techStack": [
      "WebRTC",
      "Node.js",
      "Redis",
      "React"
    ],
    "difficulty": "Intermediate",
    "status": {
      "label": "Ideation",
      "variant": "default",
      "stage": "Ideation"
    },
    "leadName": "@code_ninja",
    "memberNames": [
      "Nina Volkov",
      "Théo Marchand"
    ],
    "openPositions": [
      {
        "role": "Full Stack Engineer",
        "slots": "2 slots"
      }
    ],
    "progress": {
      "label": "Architecture & Design Spec",
      "percent": 20,
      "icon": "blueprint",
      "barVariant": "primary"
    },
    "version": null
  }
];
const library = [
  {
    "title": "Realtime Chat Engine",
    "language": "JavaScript",
    "description": "Lightweight WebSocket chat server with rooms, typing indicators and message persistence — drop into any Node backend in minutes.",
    "tags": [
      "Node.js",
      "WebSocket",
      "Express"
    ],
    "authorName": "@maya_codes",
    "stars": 812,
    "sizeKb": 340,
    "repoUrl": "https://github.com/devsphere-samples/realtime-chat-engine",
    "downloadUrl": "https://github.com/devsphere-samples/realtime-chat-engine/archive/refs/heads/main.zip"
  },
  {
    "title": "ML Preprocessing Toolkit",
    "language": "Python",
    "description": "A batteries-included pandas/numpy pipeline for cleaning, encoding and splitting tabular datasets before model training.",
    "tags": [
      "pandas",
      "numpy",
      "scikit-learn"
    ],
    "authorName": "@arjun_ai",
    "stars": 1204,
    "sizeKb": 512,
    "repoUrl": "https://github.com/devsphere-samples/ml-preprocessing-toolkit",
    "downloadUrl": "https://github.com/devsphere-samples/ml-preprocessing-toolkit/archive/refs/heads/main.zip"
  },
  {
    "title": "Spring Boot Auth Starter",
    "language": "Java",
    "description": "JWT-based authentication starter with role-based access control, refresh tokens and a ready-to-use Postman collection.",
    "tags": [
      "Spring Boot",
      "JWT",
      "PostgreSQL"
    ],
    "authorName": "@devon_park",
    "stars": 645,
    "sizeKb": 780,
    "repoUrl": "https://github.com/devsphere-samples/spring-boot-auth-starter",
    "downloadUrl": "https://github.com/devsphere-samples/spring-boot-auth-starter/archive/refs/heads/main.zip"
  },
  {
    "title": "Pathfinding Visualizer",
    "language": "C++",
    "description": "SFML-powered grid visualizer for A*, Dijkstra and BFS with adjustable weights — great for teaching graph algorithms.",
    "tags": [
      "SFML",
      "Algorithms",
      "Graphs"
    ],
    "authorName": "@theo_brandt",
    "stars": 398,
    "sizeKb": 210,
    "repoUrl": "https://github.com/devsphere-samples/pathfinding-visualizer",
    "downloadUrl": "https://github.com/devsphere-samples/pathfinding-visualizer/archive/refs/heads/main.zip"
  },
  {
    "title": "Concurrent Task Runner CLI",
    "language": "Go",
    "description": "A tiny CLI that fans out shell tasks across goroutines with live progress bars and a summary report at the end.",
    "tags": [
      "CLI",
      "Goroutines",
      "DevOps"
    ],
    "authorName": "@sarah_infra",
    "stars": 521,
    "sizeKb": 160,
    "repoUrl": "https://github.com/devsphere-samples/concurrent-task-runner",
    "downloadUrl": "https://github.com/devsphere-samples/concurrent-task-runner/archive/refs/heads/main.zip"
  },
  {
    "title": "WASM Image Filters",
    "language": "Rust",
    "description": "Compile-to-WebAssembly image filter library (blur, sharpen, grayscale) benchmarked against pure-JS canvas filters.",
    "tags": [
      "WebAssembly",
      "wasm-bindgen",
      "Canvas"
    ],
    "authorName": "@lena_fischer",
    "stars": 933,
    "sizeKb": 290,
    "repoUrl": "https://github.com/devsphere-samples/wasm-image-filters",
    "downloadUrl": "https://github.com/devsphere-samples/wasm-image-filters/archive/refs/heads/main.zip"
  },
  {
    "title": "Headless CMS Starter",
    "language": "PHP",
    "description": "Laravel-based headless CMS with a REST + GraphQL API, media library, and role-scoped content workflows out of the box.",
    "tags": [
      "Laravel",
      "GraphQL",
      "MySQL"
    ],
    "authorName": "@ines_costa",
    "stars": 456,
    "sizeKb": 620,
    "repoUrl": "https://github.com/devsphere-samples/headless-cms-starter",
    "downloadUrl": "https://github.com/devsphere-samples/headless-cms-starter/archive/refs/heads/main.zip"
  },
  {
    "title": "Offline-First Sync Kit",
    "language": "Kotlin",
    "description": "Room + WorkManager scaffolding for Android apps that need reliable offline writes with background conflict resolution.",
    "tags": [
      "Room",
      "WorkManager",
      "Coroutines"
    ],
    "authorName": "@mads_holm",
    "stars": 372,
    "sizeKb": 260,
    "repoUrl": "https://github.com/devsphere-samples/offline-first-sync-kit",
    "downloadUrl": "https://github.com/devsphere-samples/offline-first-sync-kit/archive/refs/heads/main.zip"
  },
  {
    "title": "SwiftUI Charting Kit",
    "language": "Swift",
    "description": "A small collection of animated, accessible chart views (line, bar, donut) built purely with native SwiftUI shapes.",
    "tags": [
      "SwiftUI",
      "iOS",
      "Animation"
    ],
    "authorName": "@kelsey_wren",
    "stars": 289,
    "sizeKb": 140,
    "repoUrl": "https://github.com/devsphere-samples/swiftui-charting-kit",
    "downloadUrl": "https://github.com/devsphere-samples/swiftui-charting-kit/archive/refs/heads/main.zip"
  },
  {
    "title": "Type-Safe Form Builder",
    "language": "TypeScript",
    "description": "Schema-driven React form builder with Zod validation, generating fully typed forms from a single config object.",
    "tags": [
      "React",
      "Zod",
      "Forms"
    ],
    "authorName": "@nina_volkov",
    "stars": 1088,
    "sizeKb": 180,
    "repoUrl": "https://github.com/devsphere-samples/type-safe-form-builder",
    "downloadUrl": "https://github.com/devsphere-samples/type-safe-form-builder/archive/refs/heads/main.zip"
  }
];
const questions = [
  {
    "title": "How to resolve high CPU spikes in Tokio WebSocket worker pool under 50k concurrent connections?",
    "body": "We are observing intermittent thread starvation in Tokio multi-thread runtime when handling rapid connection dropouts. Below is our current worker dispatch loop:",
    "tags": [
      "rust",
      "async-io",
      "networking",
      "performance"
    ],
    "authorName": "Evelyn Chen",
    "authorRole": "Principal Systems Engineer @ Orbit",
    "votes": 142,
    "answers": 18,
    "views": 3400,
    "answered": true,
    "flag": "none",
    "version": "tokio-v1.38",
    "code": {
      "file": "src/transport/worker.rs",
      "lang": "rust",
      "snippet": "let (tx, mut rx) = mpsc::channel(1024);\ntokio::spawn(async move {\n    while let Some(msg) = rx.recv().await {\n        process_frame(msg).await;\n    }\n});"
    },
    "ageMinutes": 45
  },
  {
    "title": "Zero-downtime schema migration strategy using CockroachDB and Prisma with foreign keys",
    "body": "We need to alter a table with 25M rows in production. Looking for proven patterns using pgroll or shadow tables without read degradation and index rebuilding locks during peak distributed traffic.",
    "tags": [
      "cockroachdb",
      "prisma",
      "sql",
      "database-migration"
    ],
    "authorName": "Marcus Vance",
    "authorRole": "Staff SRE",
    "votes": 89,
    "answers": 7,
    "views": 1200,
    "answered": false,
    "flag": "active",
    "version": "",
    "ageMinutes": 180
  },
  {
    "title": "Best practices for React 19 Server Actions vs Route Handlers with optimistic mutations in Next.js 15",
    "body": "Benchmarking cold start latency and cache invalidation strategies between `useActionState` and manual TanStack Query mutation bindings. What trade-offs have you observed when dealing with multipart form payloads?",
    "tags": [
      "nextjs",
      "react19",
      "typescript",
      "state-management"
    ],
    "authorName": "Sarah Lin",
    "authorRole": "Staff Engineer @ Cloudflare",
    "votes": 215,
    "answers": 31,
    "views": 8900,
    "answered": true,
    "flag": "hot",
    "version": "",
    "ageMinutes": 360
  },
  {
    "title": "Memory leak in Node.js 22 worker_threads with SharedArrayBuffer and WebAssembly instances",
    "body": "Running repetitive isolated WASM compilation runs inside worker pools causes non-heap memory to escalate until kernel OOM killer triggers. Node heap snapshots show clean allocations.",
    "tags": [
      "nodejs",
      "wasm",
      "memory-leak",
      "concurrency"
    ],
    "authorName": "Alex Chen",
    "authorRole": "Community member",
    "votes": 34,
    "answers": 0,
    "views": 410,
    "answered": false,
    "flag": "triage",
    "version": "",
    "ageMinutes": 480
  },
  {
    "title": "Why does my useEffect run twice in React 18 development mode?",
    "body": "I just upgraded to React 18 and StrictMode seems to mount my component, unmount it, then mount it again — my API call fires twice. Is this expected, and how do people handle side effects safely?",
    "tags": [
      "React",
      "JavaScript"
    ],
    "authorName": "Priya Nair",
    "authorRole": "Community member",
    "votes": 42,
    "answers": 6,
    "views": 1284,
    "answered": true,
    "flag": "none",
    "version": "",
    "ageMinutes": 120
  },
  {
    "title": "Best way to structure a Node.js + Express project for a mid-size API",
    "body": "Starting a new backend and want to avoid the classic 'everything in one routes file' mess. Looking for a folder structure that scales — controllers, services, repositories?",
    "tags": [
      "Node.js",
      "System Design"
    ],
    "authorName": "Marcus Bell",
    "authorRole": "Community member",
    "votes": 31,
    "answers": 4,
    "views": 902,
    "answered": true,
    "flag": "none",
    "version": "",
    "ageMinutes": 360
  },
  {
    "title": "Two pointer vs sliding window — how do I tell which one a problem wants?",
    "body": "I keep freezing in interviews trying to decide between two pointers and sliding window for array problems. Are there signal words in the prompt that give it away?",
    "tags": [
      "Arrays",
      "Career"
    ],
    "authorName": "Sofia Reyes",
    "authorRole": "Community member",
    "votes": 58,
    "answers": 9,
    "views": 2140,
    "answered": true,
    "flag": "none",
    "version": "",
    "ageMinutes": 1440
  },
  {
    "title": "CSS grid vs flexbox for a dashboard layout with a fixed sidebar",
    "body": "Building an admin dashboard with a fixed-width sidebar, sticky header, and scrollable content area. Would you reach for grid or flexbox here, and why?",
    "tags": [
      "CSS"
    ],
    "authorName": "Daniel Kim",
    "authorRole": "Community member",
    "votes": 19,
    "answers": 5,
    "views": 764,
    "answered": true,
    "flag": "none",
    "version": "",
    "ageMinutes": 1440
  },
  {
    "title": "Git rebase vs merge — what does your team actually use in practice?",
    "body": "Our team is split. Half want a clean linear history with rebase, half say merge commits preserve context. What's worked for larger teams?",
    "tags": [
      "Git",
      "Career"
    ],
    "authorName": "Amara Chukwu",
    "authorRole": "Community member",
    "votes": 27,
    "answers": 11,
    "views": 1530,
    "answered": true,
    "flag": "none",
    "version": "",
    "ageMinutes": 2880
  },
  {
    "title": "TypeScript generics for a reusable API hook — stuck on inference",
    "body": "I have a `useFetch<T>` hook but TypeScript won't infer `T` from the URL alone, and I don't want to pass it manually every time. Any patterns for this?",
    "tags": [
      "TypeScript",
      "React"
    ],
    "authorName": "Jonas Weber",
    "authorRole": "Community member",
    "votes": 15,
    "answers": 3,
    "views": 512,
    "answered": false,
    "flag": "none",
    "version": "",
    "ageMinutes": 180
  },
  {
    "title": "How do you design a URL shortener for a system design interview?",
    "body": "Trying to prep the classic 'design bit.ly' question. What's the right level of detail on hashing, database choice, and handling redirects at scale?",
    "tags": [
      "System Design"
    ],
    "authorName": "Elena Petrova",
    "authorRole": "Community member",
    "votes": 64,
    "answers": 8,
    "views": 3012,
    "answered": true,
    "flag": "none",
    "version": "",
    "ageMinutes": 4320
  },
  {
    "title": "SQL: when should I actually use a window function instead of GROUP BY?",
    "body": "I understand the syntax of ROW_NUMBER() and RANK(), but I keep defaulting to GROUP BY + subqueries out of habit. When is a window function clearly the better tool?",
    "tags": [
      "SQL"
    ],
    "authorName": "Wei Zhang",
    "authorRole": "Community member",
    "votes": 22,
    "answers": 4,
    "views": 890,
    "answered": true,
    "flag": "none",
    "version": "",
    "ageMinutes": 5760
  },
  {
    "title": "Dockerizing a local dev environment with hot reload for a Vite app",
    "body": "My container builds fine but file changes on the host aren't triggering Vite's hot reload inside Docker. Is this a volume mounting issue or a polling setting?",
    "tags": [
      "Docker",
      "JavaScript"
    ],
    "authorName": "Liam O'Connor",
    "authorRole": "Community member",
    "votes": 12,
    "answers": 2,
    "views": 340,
    "answered": false,
    "flag": "none",
    "version": "",
    "ageMinutes": 540
  },
  {
    "title": "How much DSA grinding is actually necessary before applying to mid-level roles?",
    "body": "I've done ~120 problems on and off for six months. Is there a point of diminishing returns, or should I keep going before I start applying?",
    "tags": [
      "Career",
      "Arrays"
    ],
    "authorName": "Grace Okafor",
    "authorRole": "Community member",
    "votes": 89,
    "answers": 14,
    "views": 4210,
    "answered": true,
    "flag": "none",
    "version": "",
    "ageMinutes": 7200
  },
  {
    "title": "Python: list comprehension readability vs a plain for loop",
    "body": "At what point does a list comprehension become 'too clever' and worth unrolling into a regular loop for the next person reading the code?",
    "tags": [
      "Python"
    ],
    "authorName": "Noah Fischer",
    "authorRole": "Community member",
    "votes": 17,
    "answers": 6,
    "views": 601,
    "answered": true,
    "flag": "none",
    "version": "",
    "ageMinutes": 8640
  },
  {
    "title": "Debouncing a search input in React without extra libraries",
    "body": "Want to debounce an onChange handler for a search box. Is a custom useDebounce hook with useRef/useEffect the standard approach now, or is there something simpler?",
    "tags": [
      "React",
      "JavaScript"
    ],
    "authorName": "Priya Nair",
    "authorRole": "Community member",
    "votes": 8,
    "answers": 1,
    "views": 210,
    "answered": false,
    "flag": "none",
    "version": "",
    "ageMinutes": 60
  }
];
const resources = [
  {
    "title": "MDN Web Docs",
    "category": "guides",
    "type": "Reference",
    "provider": "Mozilla",
    "iconName": "BookOpen",
    "accent": "primary",
    "free": true,
    "tags": [
      "HTML",
      "CSS",
      "JavaScript"
    ],
    "summary": "The reference every web developer keeps a tab open to — precise, vendor-neutral, and kept current.",
    "details": "Covers HTML, CSS, JavaScript and the Web APIs from first principles to edge cases, with browser-compatibility tables on nearly every page. Best used as a lookup while you build rather than read cover to cover.",
    "url": "https://developer.mozilla.org"
  },
  {
    "title": "roadmap.sh",
    "category": "guides",
    "type": "Guide",
    "provider": "Community",
    "iconName": "Layers",
    "accent": "secondary",
    "free": true,
    "tags": [
      "Career paths",
      "Visual guides"
    ],
    "summary": "Visual, community-maintained roadmaps for almost every engineering discipline.",
    "details": "Useful for sanity-checking your own learning order against what the wider community converged on, and for scoping a new discipline before you commit weeks to it.",
    "url": "https://roadmap.sh"
  },
  {
    "title": "System Design Primer",
    "category": "guides",
    "type": "Guide",
    "provider": "GitHub · donnemartin",
    "iconName": "GitBranch",
    "accent": "tertiary",
    "free": true,
    "tags": [
      "System Design",
      "Interviews"
    ],
    "summary": "An open-source crash course on designing large-scale systems, with worked examples.",
    "details": "Walks through scalability fundamentals — caching, load balancing, sharding, consistency trade-offs — then applies them to realistic interview-style prompts with reference solutions.",
    "url": "https://github.com/donnemartin/system-design-primer"
  },
  {
    "title": "Kubernetes Docs",
    "category": "guides",
    "type": "Reference",
    "provider": "CNCF",
    "iconName": "BookOpen",
    "accent": "primary",
    "free": true,
    "tags": [
      "DevOps",
      "Containers"
    ],
    "summary": "The canonical source for how Kubernetes objects and controllers actually behave.",
    "details": "Denser than most tutorials, but it's the only place guaranteed to match your cluster's real behavior. The Concepts and Tasks sections are the most useful entry points for day-to-day work.",
    "url": "https://kubernetes.io/docs/home/"
  },
  {
    "title": "freeCodeCamp",
    "category": "courses",
    "type": "Course",
    "provider": "freeCodeCamp.org",
    "iconName": "GraduationCap",
    "accent": "secondary",
    "free": true,
    "tags": [
      "Full-Stack",
      "Certifications"
    ],
    "summary": "Project-based curriculum that takes you from fundamentals to shipped full-stack apps.",
    "details": "Structured into certifications you build toward — each one ends in real projects rather than multiple-choice quizzes, which makes the progress easy to point to later.",
    "url": "https://www.freecodecamp.org"
  },
  {
    "title": "The Odin Project",
    "category": "courses",
    "type": "Course",
    "provider": "Community",
    "iconName": "GraduationCap",
    "accent": "tertiary",
    "free": true,
    "tags": [
      "Full-Stack",
      "Ruby & JS paths"
    ],
    "summary": "A full-stack curriculum built entirely from other free resources, stitched into a coherent path.",
    "details": "Doesn't reinvent content — it curates and sequences the best existing free material, then adds its own projects to force you to actually apply it before moving on.",
    "url": "https://www.theodinproject.com"
  },
  {
    "title": "CS50: Intro to Computer Science",
    "category": "courses",
    "type": "Course",
    "provider": "Harvard University",
    "iconName": "GraduationCap",
    "accent": "primary",
    "free": true,
    "tags": [
      "CS Fundamentals",
      "Algorithms"
    ],
    "summary": "Harvard's famous intro course — a genuinely rigorous foundation, free and self-paced online.",
    "details": "Starts from C and works up through arrays, algorithms, memory, data structures and web development. Heavier than most bootcamp-style courses, but it pays off in how little you have to relearn later.",
    "url": "https://cs50.harvard.edu/x/"
  },
  {
    "title": "AWS Skill Builder",
    "category": "courses",
    "type": "Course",
    "provider": "Amazon Web Services",
    "iconName": "GraduationCap",
    "accent": "secondary",
    "free": true,
    "tags": [
      "Cloud",
      "Certifications"
    ],
    "summary": "Official, free training paths that map directly onto AWS certification exams.",
    "details": "Good for structured cloud learning specifically because the content and the exam are written by the same team — there's no guessing which parts matter.",
    "url": "https://skillbuilder.aws"
  },
  {
    "title": "LeetCode",
    "category": "practice",
    "type": "Practice",
    "provider": "LeetCode",
    "iconName": "Terminal",
    "accent": "tertiary",
    "free": true,
    "tags": [
      "DSA",
      "Mock Interviews"
    ],
    "summary": "The default place to drill data structures and algorithms under a timer.",
    "details": "Thousands of problems tagged by pattern and company, plus timed mock-interview mode. Most useful once you already know the underlying concepts and just need reps.",
    "url": "https://leetcode.com"
  },
  {
    "title": "Exercism",
    "category": "practice",
    "type": "Practice",
    "provider": "Exercism.org",
    "iconName": "Code2",
    "accent": "primary",
    "free": true,
    "tags": [
      "Language mastery",
      "Mentored review"
    ],
    "summary": "Language-specific exercises with real humans reviewing your solutions for free.",
    "details": "Less about interview drills, more about actually getting fluent in a language's idioms — the mentor feedback on style and edge cases is the real value here.",
    "url": "https://exercism.org"
  },
  {
    "title": "Regex101",
    "category": "practice",
    "type": "Tool",
    "provider": "regex101.com",
    "iconName": "Wrench",
    "accent": "secondary",
    "free": true,
    "tags": [
      "Regex",
      "Debugging"
    ],
    "summary": "Build and debug regular expressions with a live, explained match breakdown.",
    "details": "Explains every token of your pattern in plain language as you type, which makes it far faster than trial-and-error for anything beyond a trivial regex.",
    "url": "https://regex101.com"
  },
  {
    "title": "Stack Overflow",
    "category": "community",
    "type": "Community",
    "provider": "Stack Exchange",
    "iconName": "MessagesSquare",
    "accent": "tertiary",
    "free": true,
    "tags": [
      "Q&A",
      "Troubleshooting"
    ],
    "summary": "The largest archive of already-answered programming questions on the internet.",
    "details": "Search before you post — odds are good your exact error has already been solved. Answers are voted and edited over time, so older accepted answers can occasionally be stale.",
    "url": "https://stackoverflow.com"
  },
  {
    "title": "DEV Community",
    "category": "community",
    "type": "Community",
    "provider": "dev.to",
    "iconName": "MessagesSquare",
    "accent": "primary",
    "free": true,
    "tags": [
      "Blogging",
      "Discussion"
    ],
    "summary": "A friendlier, more conversational corner of the internet for developer writing.",
    "details": "Good for reading how other engineers actually think through problems, and a low-pressure place to publish your own write-ups once you're ready to start sharing.",
    "url": "https://dev.to"
  },
  {
    "title": "Syntax.fm",
    "category": "reading",
    "type": "Podcast",
    "provider": "Wes Bos & Scott Tolinski",
    "iconName": "Headphones",
    "accent": "secondary",
    "free": true,
    "tags": [
      "Web Dev",
      "Weekly"
    ],
    "summary": "A weekly podcast on web development — practical, opinionated, and easy to binge on a commute.",
    "details": "Two working developers talking through real tools and decisions rather than abstract theory. A good way to keep pace with the ecosystem without doom-scrolling changelogs.",
    "url": "https://syntax.fm"
  },
  {
    "title": "Designing Data-Intensive Applications",
    "category": "reading",
    "type": "Book",
    "provider": "Martin Kleppmann",
    "iconName": "Library",
    "accent": "tertiary",
    "free": false,
    "tags": [
      "Systems",
      "Databases"
    ],
    "summary": "The book engineers reach for once tutorials stop being enough for real backend systems.",
    "details": "Covers replication, partitioning, transactions and consistency models with enough rigor to actually reason about trade-offs in a design review, not just recall buzzwords.",
    "url": ""
  }
];
const roadmaps = [
  {
    "slug": "frontend-architecture",
    "order": 0,
    "title": "Full-Stack Web Mastery & Architecture",
    "tagline": "React 19 server components, streaming SSR, optimistic UI, and micro-frontends.",
    "iconName": "LayoutGrid",
    "accent": "primary",
    "level": "Intermediate",
    "version": "2025.1",
    "summary": "A structured, production-grade milestone path from foundational web architecture to distributed systems, vetted by staff engineers.",
    "reviewedBy": "Staff engineer reviewed",
    "stages": [
      {
        "id": "stage-01",
        "index": "01",
        "title": "Foundations & Runtime Architecture",
        "topics": [
          {
            "id": "arch-01",
            "code": "ARCH-01",
            "iconName": "Globe",
            "title": "HTTP/3, TLS & Browser Networking",
            "description": "QUIC protocol, congestion control, 0-RTT handshakes",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "arch-01-o1",
                "label": "Explain the core idea behind HTTP/3, TLS & Browser Networking"
              },
              {
                "id": "arch-01-o2",
                "label": "QUIC protocol, congestion control, 0-RTT handshakes"
              },
              {
                "id": "arch-01-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "core-02",
            "code": "CORE-02",
            "iconName": "Cpu",
            "title": "JavaScript Runtime & Event Loop Deep-Dive",
            "description": "V8 hidden classes, microtask queuing, memory leaks",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "core-02-o1",
                "label": "Explain the core idea behind JavaScript Runtime & Event Loop Deep-Dive"
              },
              {
                "id": "core-02-o2",
                "label": "V8 hidden classes, microtask queuing, memory leaks"
              },
              {
                "id": "core-02-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "ts-03",
            "code": "TS-03",
            "iconName": "Code2",
            "title": "TypeScript 5.4 Advanced Types & Generics",
            "description": "Conditional types, infer keyword, mapped template literals",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "ts-03-o1",
                "label": "Explain the core idea behind TypeScript 5.4 Advanced Types & Generics"
              },
              {
                "id": "ts-03-o2",
                "label": "Conditional types, infer keyword, mapped template literals"
              },
              {
                "id": "ts-03-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          }
        ]
      },
      {
        "id": "stage-02",
        "index": "02",
        "title": "Modern Frontend Architecture",
        "topics": [
          {
            "id": "react-04",
            "code": "REACT-04",
            "iconName": "LayoutGrid",
            "title": "React 19 Server Components & Actions",
            "description": "Async transitions, directive compiler, server actions",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "react-04-o1",
                "label": "Explain the core idea behind React 19 Server Components & Actions"
              },
              {
                "id": "react-04-o2",
                "label": "Async transitions, directive compiler, server actions"
              },
              {
                "id": "react-04-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "state-05",
            "code": "STATE-05",
            "iconName": "RefreshCw",
            "title": "State Management & Optimistic UI",
            "description": "Master zero-latency micro-interactions by anticipating server mutations with rollback primitives, transient caches, and hydration synchronization.",
            "level": "Intermediate",
            "duration": "3 hours",
            "outcomes": [
              {
                "id": "state-05-o1",
                "label": "Unidirectional data flow vs global centralized stores"
              },
              {
                "id": "state-05-o2",
                "label": "Handling rollbacks on network failure with useOptimistic"
              },
              {
                "id": "state-05-o3",
                "label": "Caching strategies with SWR / TanStack Query"
              },
              {
                "id": "state-05-o4",
                "label": "Concurrent mode safety & hydration mismatches"
              }
            ]
          },
          {
            "id": "edge-06",
            "code": "EDGE-06",
            "iconName": "Radio",
            "title": "Edge Rendering & Streaming SSR",
            "description": "V8 isolates, Cloudflare Workers runtime, progressive HTML chunks",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "edge-06-o1",
                "label": "Explain the core idea behind Edge Rendering & Streaming SSR"
              },
              {
                "id": "edge-06-o2",
                "label": "V8 isolates, Cloudflare Workers runtime, progressive HTML chunks"
              },
              {
                "id": "edge-06-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "mfe-07",
            "code": "MFE-07",
            "iconName": "Boxes",
            "title": "WebGL & Micro-frontends",
            "description": "Module federation, shader pipelines, isolated runtime sandboxes",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "mfe-07-o1",
                "label": "Explain the core idea behind WebGL & Micro-frontends"
              },
              {
                "id": "mfe-07-o2",
                "label": "Module federation, shader pipelines, isolated runtime sandboxes"
              },
              {
                "id": "mfe-07-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          }
        ]
      },
      {
        "id": "stage-03",
        "index": "03",
        "title": "Backend, Data & Distributed Systems",
        "topics": [
          {
            "id": "pg-08",
            "code": "DATA-08",
            "iconName": "Database",
            "title": "PostgreSQL Indexing, EXPLAIN & Connection Pooling",
            "description": "B-tree, GiST, WAL internals, PgBouncer transaction pooling",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "pg-08-o1",
                "label": "Explain the core idea behind PostgreSQL Indexing, EXPLAIN & Connection Pooling"
              },
              {
                "id": "pg-08-o2",
                "label": "B-tree, GiST, WAL internals, PgBouncer transaction pooling"
              },
              {
                "id": "pg-08-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "redis-09",
            "code": "DATA-09",
            "iconName": "Layers",
            "title": "Distributed Cache & Redis Streams",
            "description": "Cache invalidation, read-through patterns, consumer groups",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "redis-09-o1",
                "label": "Explain the core idea behind Distributed Cache & Redis Streams"
              },
              {
                "id": "redis-09-o2",
                "label": "Cache invalidation, read-through patterns, consumer groups"
              },
              {
                "id": "redis-09-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "kafka-10",
            "code": "DIST-10",
            "iconName": "Network",
            "title": "Event-Driven Microservices with gRPC & Kafka",
            "description": "Protobuf schema registries, partitioned topic ordering, idempotency",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "kafka-10-o1",
                "label": "Explain the core idea behind Event-Driven Microservices with gRPC & Kafka"
              },
              {
                "id": "kafka-10-o2",
                "label": "Protobuf schema registries, partitioned topic ordering, idempotency"
              },
              {
                "id": "kafka-10-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "ops-11",
            "code": "OPS-11",
            "iconName": "Activity",
            "title": "Production Deployment & Kubernetes Observability",
            "description": "OpenTelemetry tracing, Prometheus histograms, blue-green rollouts",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "ops-11-o1",
                "label": "Explain the core idea behind Production Deployment & Kubernetes Observability"
              },
              {
                "id": "ops-11-o2",
                "label": "OpenTelemetry tracing, Prometheus histograms, blue-green rollouts"
              },
              {
                "id": "ops-11-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          }
        ]
      }
    ],
    "featured": {
      "id": "state-05",
      "title": "State Management & Optimistic UI",
      "description": "Build resilient interfaces that assume success while handling network packet loss and race condition reconciliations gracefully.",
      "level": "Intermediate",
      "duration": "3 hours",
      "studyMaterial": [
        {
          "id": "sm1",
          "type": "docs",
          "title": "useOptimistic — React Reference",
          "source": "react.dev",
          "meta": "8 min read",
          "href": "https://react.dev/reference/react/useOptimistic"
        },
        {
          "id": "sm2",
          "type": "docs",
          "title": "TanStack Query — Overview & Caching",
          "source": "tanstack.com",
          "meta": "15 min read",
          "href": "https://tanstack.com/query/latest/docs/framework/react/overview"
        },
        {
          "id": "sm3",
          "type": "article",
          "title": "AbortController & the Fetch API",
          "source": "developer.mozilla.org",
          "meta": "10 min read",
          "href": "https://developer.mozilla.org/en-US/docs/Web/API/AbortController"
        }
      ],
      "challenges": [
        {
          "id": "c1",
          "title": "Implement an optimistic comment reaction bar",
          "description": "UI state revert, error boundary trap, debounce",
          "difficulty": "Medium"
        },
        {
          "id": "c2",
          "title": "Solve network race conditions in search typeahead",
          "description": "AbortController, sequence ordering, stale-while-revalidate",
          "difficulty": "Hard"
        }
      ],
      "discussion": {
        "activeCount": 34,
        "hotThread": "Zustand vs Jotai in 2025",
        "href": "/questions?topic=state-management"
      },
      "mentorship": {
        "slots": 2,
        "label": "Staff React architects",
        "href": "/mentorship?topic=state-management"
      },
      "snippet": {
        "filename": "optimistic-rollback.jsx",
        "code": "const [optimisticVotes, setOptimistic] =\n  useOptimistic(votes, (state, update) =>\n    state + update\n  );\n\n/* Server action with deterministic error rollback */\nasync function submitVote() {\n  setOptimistic(1);\n  await mutateVoteAPI();\n}"
      }
    }
  },
  {
    "slug": "java-backend",
    "order": 1,
    "title": "Java Backend Engineering",
    "tagline": "JVM internals, Spring Boot, concurrency primitives, and service design at scale.",
    "iconName": "Coffee",
    "accent": "secondary",
    "level": "Beginner to advanced",
    "version": "2025.1",
    "summary": "From JVM fundamentals to production Spring Boot services — concurrency, persistence, and system design for backend engineers.",
    "reviewedBy": "Staff engineer reviewed",
    "stages": [
      {
        "id": "stage-01",
        "index": "01",
        "title": "JVM Foundations & Core Java",
        "topics": [
          {
            "id": "jvm-01",
            "code": "JVM-01",
            "iconName": "Cog",
            "title": "JVM Internals & Memory Model",
            "description": "Heap generations, garbage collectors, class loading",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "jvm-01-o1",
                "label": "Explain the core idea behind JVM Internals & Memory Model"
              },
              {
                "id": "jvm-01-o2",
                "label": "Heap generations, garbage collectors, class loading"
              },
              {
                "id": "jvm-01-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "conc-02",
            "code": "CONC-02",
            "iconName": "Cpu",
            "title": "Concurrency & the Executor Framework",
            "description": "Master safe multi-threading by reasoning about visibility, thread pools, and structured concurrency before reaching for locks.",
            "level": "Intermediate",
            "duration": "2.5 hours",
            "outcomes": [
              {
                "id": "conc-02-o1",
                "label": "Happens-before relationships & the memory model"
              },
              {
                "id": "conc-02-o2",
                "label": "ExecutorService, thread pools & task queues"
              },
              {
                "id": "conc-02-o3",
                "label": "CompletableFuture composition & error handling"
              },
              {
                "id": "conc-02-o4",
                "label": "Structured concurrency (JEP 428/453) basics"
              },
              {
                "id": "conc-02-o5",
                "label": "Diagnosing deadlocks & thread-dump analysis"
              }
            ]
          },
          {
            "id": "streams-03",
            "code": "CORE-03",
            "iconName": "Terminal",
            "title": "Streams, Generics & Functional Interfaces",
            "description": "Lambda composition, bounded wildcards, collectors",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "streams-03-o1",
                "label": "Explain the core idea behind Streams, Generics & Functional Interfaces"
              },
              {
                "id": "streams-03-o2",
                "label": "Lambda composition, bounded wildcards, collectors"
              },
              {
                "id": "streams-03-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          }
        ]
      },
      {
        "id": "stage-02",
        "index": "02",
        "title": "Spring Boot & Persistence",
        "topics": [
          {
            "id": "spring-04",
            "code": "SPR-04",
            "iconName": "Server",
            "title": "Spring Boot & Dependency Injection",
            "description": "Bean lifecycle, auto-configuration, profiles",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "spring-04-o1",
                "label": "Explain the core idea behind Spring Boot & Dependency Injection"
              },
              {
                "id": "spring-04-o2",
                "label": "Bean lifecycle, auto-configuration, profiles"
              },
              {
                "id": "spring-04-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "jpa-05",
            "code": "DATA-05",
            "iconName": "Database",
            "title": "Spring Data JPA & Transaction Boundaries",
            "description": "N+1 queries, isolation levels, optimistic locking",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "jpa-05-o1",
                "label": "Explain the core idea behind Spring Data JPA & Transaction Boundaries"
              },
              {
                "id": "jpa-05-o2",
                "label": "N+1 queries, isolation levels, optimistic locking"
              },
              {
                "id": "jpa-05-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "sec-06",
            "code": "SEC-06",
            "iconName": "ShieldCheck",
            "title": "Spring Security & OAuth2 Resource Servers",
            "description": "JWT validation, method security, CSRF strategy",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "sec-06-o1",
                "label": "Explain the core idea behind Spring Security & OAuth2 Resource Servers"
              },
              {
                "id": "sec-06-o2",
                "label": "JWT validation, method security, CSRF strategy"
              },
              {
                "id": "sec-06-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          }
        ]
      }
    ],
    "featured": {
      "id": "conc-02",
      "title": "Concurrency & the Executor Framework",
      "description": "Learn to reason about thread safety with visibility guarantees, immutable state, and pooled executors instead of ad-hoc locking.",
      "level": "Intermediate",
      "duration": "2.5 hours",
      "studyMaterial": [
        {
          "id": "sm1",
          "type": "docs",
          "title": "ExecutorService — Java SE Documentation",
          "source": "docs.oracle.com",
          "meta": "10 min read",
          "href": "https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ExecutorService.html"
        },
        {
          "id": "sm2",
          "type": "article",
          "title": "A Guide to the Java ExecutorService",
          "source": "baeldung.com",
          "meta": "12 min read",
          "href": "https://www.baeldung.com/java-executor-service-tutorial"
        },
        {
          "id": "sm3",
          "type": "docs",
          "title": "JEP 428 — Structured Concurrency",
          "source": "openjdk.org",
          "meta": "15 min read",
          "href": "https://openjdk.org/jeps/428"
        }
      ],
      "challenges": [
        {
          "id": "c1",
          "title": "Build a bounded worker pool for image resizing",
          "description": "Backpressure, rejection policy, graceful shutdown",
          "difficulty": "Medium"
        },
        {
          "id": "c2",
          "title": "Debug a producer-consumer deadlock",
          "description": "Thread dumps, lock ordering, reentrant locks",
          "difficulty": "Hard"
        }
      ],
      "discussion": {
        "activeCount": 19,
        "hotThread": "Virtual threads vs platform threads",
        "href": "/questions?topic=java-concurrency"
      },
      "mentorship": {
        "slots": 3,
        "label": "Backend platform engineers",
        "href": "/mentorship?topic=java-concurrency"
      },
      "snippet": {
        "filename": "BoundedWorkerPool.java",
        "code": "ExecutorService pool = new ThreadPoolExecutor(\n  4, 8, 30, TimeUnit.SECONDS,\n  new ArrayBlockingQueue<>(100),\n  new ThreadPoolExecutor.CallerRunsPolicy()\n);\n\n/* Submit with backpressure instead of unbounded queuing */\nFuture<Image> resized = pool.submit(() -> resize(image));"
      }
    }
  },
  {
    "slug": "python-ai-ml",
    "order": 2,
    "title": "Python & Machine Learning",
    "tagline": "NumPy internals, PyTorch fundamentals, vector databases, and RAG pipelines.",
    "iconName": "Brain",
    "accent": "tertiary",
    "level": "Specialization",
    "version": "2025.1",
    "summary": "From NumPy internals to production RAG pipelines — the applied ML path for engineers moving into AI systems.",
    "reviewedBy": "Staff engineer reviewed",
    "stages": [
      {
        "id": "stage-01",
        "index": "01",
        "title": "Python & Numerical Foundations",
        "topics": [
          {
            "id": "num-01",
            "code": "NUM-01",
            "iconName": "Sigma",
            "title": "NumPy Internals & Vectorization",
            "description": "Get comfortable replacing loops with broadcasted array operations before moving into tensor libraries.",
            "level": "Beginner",
            "duration": "2 hours",
            "outcomes": [
              {
                "id": "num-01-o1",
                "label": "Strides, dtypes & contiguous memory layout"
              },
              {
                "id": "num-01-o2",
                "label": "Broadcasting rules & shape alignment"
              },
              {
                "id": "num-01-o3",
                "label": "Vectorizing loops with ufuncs"
              },
              {
                "id": "num-01-o4",
                "label": "Views vs copies & avoiding silent bugs"
              }
            ]
          },
          {
            "id": "pandas-02",
            "code": "DATA-02",
            "iconName": "LineChart",
            "title": "Pandas for Data Wrangling",
            "description": "Vectorized transforms, groupby internals, memory layout",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "pandas-02-o1",
                "label": "Explain the core idea behind Pandas for Data Wrangling"
              },
              {
                "id": "pandas-02-o2",
                "label": "Vectorized transforms, groupby internals, memory layout"
              },
              {
                "id": "pandas-02-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "torch-03",
            "code": "ML-03",
            "iconName": "Bot",
            "title": "PyTorch Tensors & Autograd",
            "description": "Computation graphs, gradients, custom loss functions",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "torch-03-o1",
                "label": "Explain the core idea behind PyTorch Tensors & Autograd"
              },
              {
                "id": "torch-03-o2",
                "label": "Computation graphs, gradients, custom loss functions"
              },
              {
                "id": "torch-03-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          }
        ]
      },
      {
        "id": "stage-02",
        "index": "02",
        "title": "Applied ML & RAG Pipelines",
        "topics": [
          {
            "id": "vec-04",
            "code": "ML-04",
            "iconName": "Layers",
            "title": "Vector Databases & Embeddings",
            "description": "pgvector, Pinecone, approximate nearest neighbour search",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "vec-04-o1",
                "label": "Explain the core idea behind Vector Databases & Embeddings"
              },
              {
                "id": "vec-04-o2",
                "label": "pgvector, Pinecone, approximate nearest neighbour search"
              },
              {
                "id": "vec-04-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "rag-05",
            "code": "ML-05",
            "iconName": "Network",
            "title": "Retrieval-Augmented Generation Pipelines",
            "description": "Chunking strategies, reranking, hallucination mitigation",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "rag-05-o1",
                "label": "Explain the core idea behind Retrieval-Augmented Generation Pipelines"
              },
              {
                "id": "rag-05-o2",
                "label": "Chunking strategies, reranking, hallucination mitigation"
              },
              {
                "id": "rag-05-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "ft-06",
            "code": "ML-06",
            "iconName": "Brain",
            "title": "Fine-Tuning & LoRA Adapters",
            "description": "Parameter-efficient fine-tuning, evaluation harnesses",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "ft-06-o1",
                "label": "Explain the core idea behind Fine-Tuning & LoRA Adapters"
              },
              {
                "id": "ft-06-o2",
                "label": "Parameter-efficient fine-tuning, evaluation harnesses"
              },
              {
                "id": "ft-06-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          }
        ]
      }
    ],
    "featured": {
      "id": "num-01",
      "title": "NumPy Internals & Vectorization",
      "description": "Understand how NumPy stores and operates on arrays so you can write vectorized code that's an order of magnitude faster than Python loops.",
      "level": "Beginner",
      "duration": "2 hours",
      "studyMaterial": [
        {
          "id": "sm1",
          "type": "docs",
          "title": "NumPy Broadcasting — User Guide",
          "source": "numpy.org",
          "meta": "9 min read",
          "href": "https://numpy.org/doc/stable/user/basics.broadcasting.html"
        },
        {
          "id": "sm2",
          "type": "docs",
          "title": "The N-Dimensional Array (ndarray)",
          "source": "numpy.org",
          "meta": "12 min read",
          "href": "https://numpy.org/doc/stable/reference/arrays.ndarray.html"
        },
        {
          "id": "sm3",
          "type": "article",
          "title": "NumPy Array Programming",
          "source": "realpython.com",
          "meta": "20 min read",
          "href": "https://realpython.com/numpy-array-programming/"
        }
      ],
      "challenges": [
        {
          "id": "c1",
          "title": "Vectorize a pairwise distance calculation",
          "description": "Broadcasting, avoiding intermediate copies",
          "difficulty": "Easy"
        },
        {
          "id": "c2",
          "title": "Debug a silent view/copy mutation bug",
          "description": "Memory layout, .copy() vs slicing",
          "difficulty": "Medium"
        }
      ],
      "discussion": {
        "activeCount": 12,
        "hotThread": "NumPy 2.0 breaking changes",
        "href": "/questions?topic=numpy"
      },
      "mentorship": {
        "slots": 4,
        "label": "ML platform engineers",
        "href": "/mentorship?topic=numpy"
      },
      "snippet": {
        "filename": "vectorized_distance.py",
        "code": "import numpy as np\n\n# Pairwise Euclidean distance without Python loops\ndef pairwise_distance(a, b):\n    diff = a[:, None, :] - b[None, :, :]\n    return np.sqrt((diff ** 2).sum(axis=-1))"
      }
    }
  },
  {
    "slug": "devops-cloud",
    "order": 3,
    "title": "DevOps & Cloud Infrastructure",
    "tagline": "Docker, Kubernetes, Terraform, and CI/CD pipelines that ship safely at 2am.",
    "iconName": "Cloud",
    "accent": "secondary",
    "level": "Intermediate",
    "version": "2025.1",
    "summary": "Containers, orchestration, infrastructure as code, and CI/CD pipelines — the operational backbone behind every production system.",
    "reviewedBy": "Staff SRE reviewed",
    "stages": [
      {
        "id": "stage-01",
        "index": "01",
        "title": "Containers & Local Orchestration",
        "topics": [
          {
            "id": "docker-01",
            "code": "OPS-01",
            "iconName": "Container",
            "title": "Docker Images & Multi-Stage Builds",
            "description": "Layer caching, distroless images, build contexts",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "docker-01-o1",
                "label": "Explain the core idea behind Docker Images & Multi-Stage Builds"
              },
              {
                "id": "docker-01-o2",
                "label": "Layer caching, distroless images, build contexts"
              },
              {
                "id": "docker-01-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "k8s-02",
            "code": "OPS-02",
            "iconName": "Workflow",
            "title": "Kubernetes Core Objects & Networking",
            "description": "Get comfortable reasoning about pods, services, and ingress before touching production clusters — this is the foundation everything else builds on.",
            "level": "Intermediate",
            "duration": "3 hours",
            "outcomes": [
              {
                "id": "k8s-02-o1",
                "label": "Pods, ReplicaSets & Deployments"
              },
              {
                "id": "k8s-02-o2",
                "label": "ClusterIP, NodePort & LoadBalancer services"
              },
              {
                "id": "k8s-02-o3",
                "label": "Ingress controllers & path-based routing"
              },
              {
                "id": "k8s-02-o4",
                "label": "ConfigMaps, Secrets & readiness probes"
              }
            ]
          },
          {
            "id": "compose-03",
            "code": "OPS-03",
            "iconName": "GitBranch",
            "title": "CI/CD Pipelines with GitHub Actions",
            "description": "Matrix builds, caching strategies, deployment gates",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "compose-03-o1",
                "label": "Explain the core idea behind CI/CD Pipelines with GitHub Actions"
              },
              {
                "id": "compose-03-o2",
                "label": "Matrix builds, caching strategies, deployment gates"
              },
              {
                "id": "compose-03-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          }
        ]
      },
      {
        "id": "stage-02",
        "index": "02",
        "title": "Infrastructure as Code & Observability",
        "topics": [
          {
            "id": "tf-04",
            "code": "IAC-04",
            "iconName": "Cloud",
            "title": "Terraform Modules & State Management",
            "description": "Remote state, workspaces, drift detection",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "tf-04-o1",
                "label": "Explain the core idea behind Terraform Modules & State Management"
              },
              {
                "id": "tf-04-o2",
                "label": "Remote state, workspaces, drift detection"
              },
              {
                "id": "tf-04-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "obs-05",
            "code": "OBS-05",
            "iconName": "Activity",
            "title": "Prometheus, Grafana & Alerting",
            "description": "PromQL, histogram buckets, alert fatigue reduction",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "obs-05-o1",
                "label": "Explain the core idea behind Prometheus, Grafana & Alerting"
              },
              {
                "id": "obs-05-o2",
                "label": "PromQL, histogram buckets, alert fatigue reduction"
              },
              {
                "id": "obs-05-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "sec-06",
            "code": "SEC-06",
            "iconName": "ShieldCheck",
            "title": "Cloud IAM & Secrets Management",
            "description": "Least-privilege roles, Vault, secret rotation",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "sec-06-o1",
                "label": "Explain the core idea behind Cloud IAM & Secrets Management"
              },
              {
                "id": "sec-06-o2",
                "label": "Least-privilege roles, Vault, secret rotation"
              },
              {
                "id": "sec-06-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          }
        ]
      }
    ],
    "featured": {
      "id": "k8s-02",
      "title": "Kubernetes Core Objects & Networking",
      "description": "Learn how pods, services, and ingress fit together so a deployment behaves predictably instead of becoming a debugging mystery at 2am.",
      "level": "Intermediate",
      "duration": "3 hours",
      "studyMaterial": [
        {
          "id": "sm1",
          "type": "docs",
          "title": "Pods — Kubernetes Concepts",
          "source": "kubernetes.io",
          "meta": "8 min read",
          "href": "https://kubernetes.io/docs/concepts/workloads/pods/"
        },
        {
          "id": "sm2",
          "type": "docs",
          "title": "Service — Kubernetes Concepts",
          "source": "kubernetes.io",
          "meta": "12 min read",
          "href": "https://kubernetes.io/docs/concepts/services-networking/service/"
        },
        {
          "id": "sm3",
          "type": "docs",
          "title": "Ingress — Kubernetes Concepts",
          "source": "kubernetes.io",
          "meta": "10 min read",
          "href": "https://kubernetes.io/docs/concepts/services-networking/ingress/"
        }
      ],
      "challenges": [
        {
          "id": "c1",
          "title": "Deploy a 3-tier app with rolling updates",
          "description": "Readiness probes, resource limits, zero-downtime rollout",
          "difficulty": "Medium"
        },
        {
          "id": "c2",
          "title": "Debug a CrashLoopBackOff in production",
          "description": "Log inspection, describe events, resource constraints",
          "difficulty": "Hard"
        }
      ],
      "discussion": {
        "activeCount": 21,
        "hotThread": "Helm vs Kustomize in 2025",
        "href": "/questions?topic=kubernetes"
      },
      "mentorship": {
        "slots": 2,
        "label": "Site reliability engineers",
        "href": "/mentorship?topic=kubernetes"
      },
      "snippet": {
        "filename": "deployment.yaml",
        "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: api-server\nspec:\n  replicas: 3\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxUnavailable: 0\n  template:\n    spec:\n      containers:\n        - name: api\n          readinessProbe:\n            httpGet: { path: /healthz, port: 8080 }"
      }
    }
  },
  {
    "slug": "dsa-interview",
    "order": 4,
    "title": "Data Structures & Algorithms",
    "tagline": "Arrays to graphs — the core patterns behind every technical interview.",
    "iconName": "Braces",
    "accent": "primary",
    "level": "Beginner to advanced",
    "version": "2025.1",
    "summary": "The core patterns behind every technical interview — arrays, trees, graphs, and the trade-offs between them.",
    "reviewedBy": "Staff engineer reviewed",
    "stages": [
      {
        "id": "stage-01",
        "index": "01",
        "title": "Arrays, Strings & Complexity",
        "topics": [
          {
            "id": "big-o-01",
            "code": "DSA-01",
            "iconName": "ListOrdered",
            "title": "Big-O Analysis & Two-Pointer Patterns",
            "description": "Time/space trade-offs, sliding window, prefix sums",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "big-o-01-o1",
                "label": "Explain the core idea behind Big-O Analysis & Two-Pointer Patterns"
              },
              {
                "id": "big-o-01-o2",
                "label": "Time/space trade-offs, sliding window, prefix sums"
              },
              {
                "id": "big-o-01-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "hash-02",
            "code": "DSA-02",
            "iconName": "Braces",
            "title": "Hash Maps & Set-Based Techniques",
            "description": "Collision handling, frequency counting, dedup patterns",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "hash-02-o1",
                "label": "Explain the core idea behind Hash Maps & Set-Based Techniques"
              },
              {
                "id": "hash-02-o2",
                "label": "Collision handling, frequency counting, dedup patterns"
              },
              {
                "id": "hash-02-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "recur-03",
            "code": "DSA-03",
            "iconName": "GitBranch",
            "title": "Recursion & Backtracking Fundamentals",
            "description": "Base cases, state-space trees, pruning",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "recur-03-o1",
                "label": "Explain the core idea behind Recursion & Backtracking Fundamentals"
              },
              {
                "id": "recur-03-o2",
                "label": "Base cases, state-space trees, pruning"
              },
              {
                "id": "recur-03-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          }
        ]
      },
      {
        "id": "stage-02",
        "index": "02",
        "title": "Trees, Heaps & Graphs",
        "topics": [
          {
            "id": "trees-04",
            "code": "DSA-04",
            "iconName": "TreePine",
            "title": "Binary Trees & BST Traversals",
            "description": "In-order/pre-order/post-order, balanced tree invariants",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "trees-04-o1",
                "label": "Explain the core idea behind Binary Trees & BST Traversals"
              },
              {
                "id": "trees-04-o2",
                "label": "In-order/pre-order/post-order, balanced tree invariants"
              },
              {
                "id": "trees-04-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          },
          {
            "id": "graphs-05",
            "code": "DSA-05",
            "iconName": "Network",
            "title": "Graph Traversal — BFS, DFS & Shortest Paths",
            "description": "Master the two traversal primitives everything else builds on, then layer in Dijkstra once BFS/DFS feel automatic.",
            "level": "Intermediate",
            "duration": "2.5 hours",
            "outcomes": [
              {
                "id": "graphs-05-o1",
                "label": "Adjacency list vs matrix trade-offs"
              },
              {
                "id": "graphs-05-o2",
                "label": "BFS for shortest unweighted paths"
              },
              {
                "id": "graphs-05-o3",
                "label": "DFS, cycle detection & topological sort"
              },
              {
                "id": "graphs-05-o4",
                "label": "Dijkstra's algorithm with a min-heap"
              }
            ]
          },
          {
            "id": "heaps-06",
            "code": "DSA-06",
            "iconName": "Layers",
            "title": "Heaps & Priority Queue Patterns",
            "description": "Top-K problems, merge-k-lists, median maintenance",
            "level": "",
            "duration": "",
            "outcomes": [
              {
                "id": "heaps-06-o1",
                "label": "Explain the core idea behind Heaps & Priority Queue Patterns"
              },
              {
                "id": "heaps-06-o2",
                "label": "Top-K problems, merge-k-lists, median maintenance"
              },
              {
                "id": "heaps-06-o3",
                "label": "Solve a practice problem using it"
              }
            ]
          }
        ]
      }
    ],
    "featured": {
      "id": "graphs-05",
      "title": "Graph Traversal — BFS, DFS & Shortest Paths",
      "description": "Build the mental model for exploring graphs level-by-level (BFS) versus depth-first (DFS), then extend into weighted shortest-path problems.",
      "level": "Intermediate",
      "duration": "2.5 hours",
      "studyMaterial": [
        {
          "id": "sm1",
          "type": "article",
          "title": "Breadth First Search or BFS for a Graph",
          "source": "geeksforgeeks.org",
          "meta": "10 min read",
          "href": "https://www.geeksforgeeks.org/dsa/breadth-first-search-or-bfs-for-a-graph/"
        },
        {
          "id": "sm2",
          "type": "article",
          "title": "Depth First Search or DFS for a Graph",
          "source": "geeksforgeeks.org",
          "meta": "10 min read",
          "href": "https://www.geeksforgeeks.org/dsa/depth-first-search-or-dfs-for-a-graph/"
        },
        {
          "id": "sm3",
          "type": "interactive",
          "title": "Single-Source Shortest Path — Visualization",
          "source": "visualgo.net",
          "meta": "Interactive",
          "href": "https://visualgo.net/en/sssp"
        }
      ],
      "challenges": [
        {
          "id": "c1",
          "title": "Find the shortest path in a grid with obstacles",
          "description": "BFS on an implicit graph, visited-set pruning",
          "difficulty": "Medium"
        },
        {
          "id": "c2",
          "title": "Detect a cycle in a directed dependency graph",
          "description": "DFS with recursion stack, topological sort",
          "difficulty": "Hard"
        }
      ],
      "discussion": {
        "activeCount": 27,
        "hotThread": "When to reach for Dijkstra vs BFS",
        "href": "/questions?topic=graphs"
      },
      "mentorship": {
        "slots": 3,
        "label": "Ex-FAANG interview coaches",
        "href": "/mentorship?topic=graphs"
      },
      "snippet": {
        "filename": "bfs_shortest_path.py",
        "code": "from collections import deque\n\ndef bfs_shortest_path(graph, start, target):\n    queue = deque([(start, 0)])\n    visited = {start}\n\n    while queue:\n        node, dist = queue.popleft()\n        if node == target:\n            return dist\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append((neighbor, dist + 1))\n    return -1"
      }
    }
  }
];

const additionalProjects = [
  { title: "Devsphere Platform", description: "Open-source platform for developer collaboration and showcase.", techStack: ["React", "Node.js", "Express", "MongoDB"], difficulty: "Intermediate", status: { label: "Ideation", variant: "default", stage: "Ideation" }, leadName: "Demo Developer", memberNames: ["Demo Developer"], openPositions: [{ role: "Frontend Engineer", slots: "2 slots" }, { role: "Backend Engineer", slots: "1 slot" }], progress: { label: "MVP setup", percent: 25, barVariant: "primary" } },
];
const additionalLibrary = [
  { title: "React Custom Hooks Collection", language: "JavaScript", description: "A curated set of reusable custom hooks for React projects.", tags: ["react", "hooks", "javascript"], authorName: "Demo Developer", stars: 12, sizeKb: 45, repoUrl: "https://github.com/example/react-hooks" },
];

// New discussions/forum seed data. These use the same placeholder users as questions.
const discussions = [
  { title: "React state updates are one render behind in a controlled form", body: "I update form state and immediately read the value to build a request. The request contains the previous value. What is the cleanest way to model this without forcing a timeout?", tags: ["react", "javascript", "forms"], authorName: "Priya Nair", votes: 24, views: 512, solved: true, answerBody: "Treat state updates as scheduled and derive the request from the next value, or move the request into an effect/event handler that receives the submitted value directly." },
  { title: "How should I choose an index for a slow PostgreSQL query?", body: "A query filters by workspace_id and status, sorts by created_at, and returns the newest 20 rows. Which index shape should I test first and how do I validate it with EXPLAIN?", tags: ["postgresql", "database", "performance"], authorName: "Marcus Vance", votes: 31, views: 840, solved: false },
  { title: "Docker Compose service cannot reach the host database", body: "The app works locally but a container cannot connect to localhost:5432. I understand localhost points to the container, but what is the portable development setup for a team?", tags: ["docker", "devops", "networking"], authorName: "Alex Chen", votes: 18, views: 390, solved: false },
  { title: "When should a beginner move from tutorials to a project?", body: "I can follow tutorials but struggle to start from a blank folder. I would like a practical learning plan that combines a roadmap, small projects, and daily coding practice.", tags: ["learning", "roadmaps", "career"], authorName: "Evelyn Chen", votes: 42, views: 1200, solved: true, answerBody: "Use a thin vertical slice: choose one small outcome, write the README first, build the smallest working version, then iterate. Tutorials should answer a specific question instead of being the whole project." },
];

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const passwordHash = () => bcrypt.hash("seed-user-not-for-login", 10);
const users = new Map();
async function getUser(name, email = null) {
  if (users.has(name)) return users.get(name);
  const address = email || `${slugify(name)}@seed.devsphere.local`;
  let user = await User.findOne({ email: address });
  if (!user) user = await User.create({ name, email: address, password: await passwordHash(), username: slugify(name) });
  users.set(name, user);
  return user;
}

async function seedUsers() {
  const demo = await User.findOne({ email: "demo@devsphere.com" }) || await User.create({ name: "Demo Developer", email: "demo@devsphere.com", password: await bcrypt.hash("password123", 10), username: "demo_developer" });
  users.set("Demo Developer", demo);
  const names = new Set();
  for (const item of questions) names.add(item.authorName);
  for (const item of discussions) names.add(item.authorName);
  for (const item of projects) { names.add(item.leadName); for (const member of item.memberNames || []) names.add(member); }
  for (const item of library) names.add(item.authorName);
  for (const item of additionalProjects) { names.add(item.leadName); for (const member of item.memberNames || []) names.add(member); }
  for (const item of additionalLibrary) names.add(item.authorName);
  for (const name of names) await getUser(name);
  return demo;
}

async function seedMentors() {
  for (const mentor of mentors) await Mentor.updateOne({ name: mentor.name }, { $setOnInsert: mentor }, { upsert: true });
}
async function seedProblems(demo) {
  const today = new Date().toISOString().slice(0, 10);
  for (const [index, original] of problems.entries()) {
    const problem = { ...original, createdBy: demo._id, points: original.points || (original.difficulty === "Hard" ? 250 : original.difficulty === "Medium" ? 150 : 100) };
    if (index === 0) problem.challengeDate = today;
    else if (!Object.prototype.hasOwnProperty.call(problem, "challengeDate")) problem.challengeDate = null;
    const { challengeDate, points, ...base } = problem;
    await Problem.updateOne({ slug: problem.slug }, { $set: { challengeDate, points }, $setOnInsert: base }, { upsert: true });
  }
}
async function seedResources() {
  for (const resource of resources) await Resource.updateOne({ title: resource.title }, { $setOnInsert: resource }, { upsert: true });
}
async function seedRoadmaps() {
  for (const roadmap of roadmaps) await Roadmap.updateOne({ slug: roadmap.slug }, { $setOnInsert: roadmap }, { upsert: true });
}
async function seedProjectsAndLibrary() {
  for (const original of projects) {
    if (await Project.exists({ title: original.title })) continue;
    const lead = await getUser(original.leadName);
    const members = [lead._id, ...await Promise.all((original.memberNames || []).map(async (name) => (await getUser(name))._id))];
    const { leadName, memberNames, ...fields } = original;
    await Project.create({ ...fields, lead: lead._id, members: [...new Map(members.map((id) => [String(id), id])).values()] });
  }
  for (const original of library) {
    if (await LibraryProject.exists({ title: original.title })) continue;
    const author = await getUser(original.authorName);
    const { authorName, ...fields } = original;
    await LibraryProject.create({ ...fields, author: author._id });
  }
  for (const original of additionalProjects) {
    if (await Project.exists({ title: original.title })) continue;
    const lead = await getUser(original.leadName);
    const { leadName, memberNames, ...fields } = original;
    await Project.create({ ...fields, lead: lead._id, members: [lead._id] });
  }
  for (const original of additionalLibrary) {
    if (await LibraryProject.exists({ title: original.title })) continue;
    const author = await getUser(original.authorName);
    const { authorName, ...fields } = original;
    await LibraryProject.create({ ...fields, author: author._id });
  }
}
async function seedQuestions() {
  for (const original of questions) {
    if (await Question.exists({ title: original.title })) continue;
    const { authorName, ageMinutes, ...fields } = original;
    const author = await getUser(authorName);
    await Question.create({ ...fields, author: author._id, createdAt: new Date(Date.now() - ageMinutes * 60 * 1000) });
  }
}
async function seedDiscussions() {
  for (const original of discussions) {
    if (await Discussion.exists({ title: original.title })) continue;
    const { authorName, answerBody, ...fields } = original;
    const author = await getUser(authorName);
    const doc = { ...fields, author: author._id };
    if (answerBody) { const answerAuthor = await getUser("Demo Developer"); doc.answers = [{ author: answerAuthor._id, body: answerBody, accepted: true }]; }
    await Discussion.create(doc);
  }
}
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const demo = await seedUsers();
  await seedMentors();
  await seedProblems(demo);
  await seedResources();
  await seedRoadmaps();
  await seedProjectsAndLibrary();
  await seedQuestions();
  await seedDiscussions();
  console.log(`Seed complete: ${roadmaps.length} roadmaps, ${problems.length} problems, ${mentors.length} mentors, ${resources.length} resources, ${questions.length} questions, ${discussions.length} discussions, ${projects.length + additionalProjects.length} projects, ${library.length + additionalLibrary.length} library projects.`);
  await mongoose.disconnect();
}
main().catch(async (error) => { console.error("Seeding failed:", error); await mongoose.disconnect().catch(() => {}); process.exitCode = 1; });
