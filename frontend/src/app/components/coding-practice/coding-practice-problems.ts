export interface CodingPracticeTestCase {
  input: string;
  expected: string;
}

export interface CodingPracticeProblem {
  title: string;
  testCases: CodingPracticeTestCase[];
  starterCode: Record<string, string>;
}

export const CODING_PRACTICE_PROBLEMS: CodingPracticeProblem[] = [
  {
    title: "Two Sum",
    testCases: [
      { input: "4\n2 7 11 15\n9", expected: "[0, 1]" },
      { input: "3\n3 2 4\n6", expected: "[1, 2]" },
      { input: "2\n3 3\n6", expected: "[0, 1]" },
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, target;
    cin >> n;
    vector<int> nums(n);
    for (int& num : nums) cin >> num;
    cin >> target;

    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                cout << "[" << i << ", " << j << "]";
                return 0;
            }
        }
    }
    cout << "No solution";
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = scanner.nextInt();
        int target = scanner.nextInt();

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == target) {
                    System.out.print("[" + i + ", " + j + "]");
                    return;
                }
            }
        }
        System.out.print("No solution");
    }
}`,
      python: `n = int(input())
nums = list(map(int, input().split()))
target = int(input())

for i in range(n):
    for j in range(i + 1, n):
        if nums[i] + nums[j] == target:
            print([i, j])
            raise SystemExit
print("No solution")`,
      javascript: `const fs = require("fs");
const values = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
const n = values[0];
const nums = values.slice(1, n + 1);
const target = values[n + 1];

for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
        if (nums[i] + nums[j] === target) {
            console.log(\`[\${i}, \${j}]\`);
            process.exit(0);
        }
    }
}
console.log("No solution");`,
    },
  },
  {
    title: "Reverse a String",
    testCases: [
      { input: "hello", expected: "olleh" },
      { input: "placement", expected: "tnemecalp" },
      { input: "a", expected: "a" },
    ],
    starterCode: {
      cpp: `#include <algorithm>
#include <iostream>
#include <string>
using namespace std;

int main() {
    string value;
    getline(cin, value);
    reverse(value.begin(), value.end());
    cout << value;
    return 0;
}`,
      java: `import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        String value = new BufferedReader(new InputStreamReader(System.in)).readLine();
        System.out.print(new StringBuilder(value == null ? "" : value).reverse());
    }
}`,
      python: `value = input()
print(value[::-1])`,
      javascript: `const fs = require("fs");
const value = fs.readFileSync(0, "utf8").replace(/\\r?\\n$/, "");
console.log([...value].reverse().join(""));`,
    },
  },
  {
    title: "Fibonacci Number",
    testCases: [
      { input: "0", expected: "0" },
      { input: "1", expected: "1" },
      { input: "6", expected: "8" },
      { input: "10", expected: "55" },
    ],
    starterCode: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int previous = 0, current = 1;
    for (int i = 0; i < n; i++) {
        int next = previous + current;
        previous = current;
        current = next;
    }
    cout << previous;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        int previous = 0, current = 1;
        for (int i = 0; i < n; i++) {
            int next = previous + current;
            previous = current;
            current = next;
        }
        System.out.print(previous);
    }
}`,
      python: `n = int(input())
previous, current = 0, 1
for _ in range(n):
    previous, current = current, previous + current
print(previous)`,
      javascript: `const fs = require("fs");
const n = Number(fs.readFileSync(0, "utf8").trim());
let previous = 0, current = 1;
for (let i = 0; i < n; i++) {
    [previous, current] = [current, previous + current];
}
console.log(previous);`,
    },
  },
  {
    title: "Binary Search",
    testCases: [
      { input: "5\n1 2 3 4 5\n3", expected: "2" },
      { input: "5\n1 2 3 4 5\n6", expected: "-1" },
      { input: "1\n7\n7", expected: "0" },
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, target;
    cin >> n;
    vector<int> nums(n);
    for (int& num : nums) cin >> num;
    cin >> target;

    int left = 0, right = n - 1;
    while (left <= right) {
        int middle = left + (right - left) / 2;
        if (nums[middle] == target) {
            cout << middle;
            return 0;
        }
        if (nums[middle] < target) left = middle + 1;
        else right = middle - 1;
    }
    cout << -1;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = scanner.nextInt();
        int target = scanner.nextInt();

        int left = 0, right = n - 1;
        while (left <= right) {
            int middle = left + (right - left) / 2;
            if (nums[middle] == target) {
                System.out.print(middle);
                return;
            }
            if (nums[middle] < target) left = middle + 1;
            else right = middle - 1;
        }
        System.out.print(-1);
    }
}`,
      python: `n = int(input())
nums = list(map(int, input().split()))
target = int(input())
left, right = 0, n - 1

while left <= right:
    middle = left + (right - left) // 2
    if nums[middle] == target:
        print(middle)
        break
    if nums[middle] < target:
        left = middle + 1
    else:
        right = middle - 1
else:
    print(-1)`,
      javascript: `const fs = require("fs");
const values = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
const n = values[0];
const nums = values.slice(1, n + 1);
const target = values[n + 1];
let left = 0, right = n - 1, answer = -1;

while (left <= right) {
    const middle = left + Math.floor((right - left) / 2);
    if (nums[middle] === target) {
        answer = middle;
        break;
    }
    if (nums[middle] < target) left = middle + 1;
    else right = middle - 1;
}
console.log(answer);`,
    },
  },
  {
    title: "Detect Cycle in Linked List",
    testCases: [
      { input: "4\n3 2 0 -4\n1", expected: "true" },
      { input: "2\n1 2\n-1", expected: "false" },
      { input: "1\n1\n0", expected: "true" },
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

struct Node {
    int value;
    Node* next = nullptr;
    explicit Node(int value) : value(value) {}
};

int main() {
    int n;
    cin >> n;
    vector<Node*> nodes;
    for (int i = 0; i < n; i++) {
        int value;
        cin >> value;
        nodes.push_back(new Node(value));
        if (i > 0) nodes[i - 1]->next = nodes[i];
    }
    int position;
    cin >> position;
    if (position >= 0 && position < n) nodes.back()->next = nodes[position];

    Node *slow = n ? nodes[0] : nullptr, *fast = slow;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            cout << "true";
            return 0;
        }
    }
    cout << "false";
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    static class Node {
        int value;
        Node next;
        Node(int value) { this.value = value; }
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        Node[] nodes = new Node[n];
        for (int i = 0; i < n; i++) {
            nodes[i] = new Node(scanner.nextInt());
            if (i > 0) nodes[i - 1].next = nodes[i];
        }
        int position = scanner.nextInt();
        if (position >= 0 && position < n) nodes[n - 1].next = nodes[position];

        Node slow = n == 0 ? null : nodes[0], fast = slow;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                System.out.print("true");
                return;
            }
        }
        System.out.print("false");
    }
}`,
      python: `values = list(map(int, input().split()))
n = values[0]
nodes = [{"next": i + 1 if i + 1 < n else None} for i in range(n)]
position = int(input())
if 0 <= position < n:
    nodes[-1]["next"] = position

slow = fast = 0 if n else None
while fast is not None and nodes[fast]["next"] is not None:
    slow = nodes[slow]["next"]
    fast = nodes[nodes[fast]["next"]]["next"]
    if slow == fast:
        print("true")
        break
else:
    print("false")`,
      javascript: `const fs = require("fs");
const values = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
const n = values[0];
const nodes = Array.from({ length: n }, (_, i) => ({ next: i + 1 < n ? i + 1 : null }));
const position = values[n + 1];
if (position >= 0 && position < n) nodes[n - 1].next = position;

let slow = n ? 0 : null, fast = slow, hasCycle = false;
while (fast !== null && nodes[fast].next !== null) {
    slow = nodes[slow].next;
    fast = nodes[nodes[fast].next].next;
    if (slow === fast) {
        hasCycle = true;
        break;
    }
}
console.log(hasCycle ? "true" : "false");`,
    },
  },
  {
    title: "Longest Common Subsequence",
    testCases: [
      { input: "abcde\nace", expected: "3" },
      { input: "abc\nabc", expected: "3" },
      { input: "abc\ndef", expected: "0" },
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <algorithm>
#include <string>
#include <vector>
using namespace std;

int main() {
    string first, second;
    getline(cin, first);
    getline(cin, second);
    vector<vector<int>> dp(first.size() + 1, vector<int>(second.size() + 1));
    for (int i = 1; i <= (int)first.size(); i++) {
        for (int j = 1; j <= (int)second.size(); j++) {
            dp[i][j] = first[i - 1] == second[j - 1]
                ? dp[i - 1][j - 1] + 1
                : max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    cout << dp[first.size()][second.size()];
    return 0;
}`,
      java: `import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String first = reader.readLine();
        String second = reader.readLine();
        if (first == null) first = "";
        if (second == null) second = "";
        int[][] dp = new int[first.length() + 1][second.length() + 1];

        for (int i = 1; i <= first.length(); i++) {
            for (int j = 1; j <= second.length(); j++) {
                dp[i][j] = first.charAt(i - 1) == second.charAt(j - 1)
                    ? dp[i - 1][j - 1] + 1
                    : Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
        System.out.print(dp[first.length()][second.length()]);
    }
}`,
      python: `first = input()
second = input()
dp = [[0] * (len(second) + 1) for _ in range(len(first) + 1)]

for i in range(1, len(first) + 1):
    for j in range(1, len(second) + 1):
        if first[i - 1] == second[j - 1]:
            dp[i][j] = dp[i - 1][j - 1] + 1
        else:
            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
print(dp[-1][-1])`,
      javascript: `const fs = require("fs");
const [first = "", second = ""] = fs.readFileSync(0, "utf8").split(/\\r?\\n/);
const dp = Array.from({ length: first.length + 1 }, () => Array(second.length + 1).fill(0));

for (let i = 1; i <= first.length; i++) {
    for (let j = 1; j <= second.length; j++) {
        dp[i][j] = first[i - 1] === second[j - 1]
            ? dp[i - 1][j - 1] + 1
            : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
}
console.log(dp[first.length][second.length]);`,
    },
  },
];

export function getCodingPracticeProblem(title: string): CodingPracticeProblem | undefined {
  const normalizedTitle = title.trim().toLowerCase();
  return CODING_PRACTICE_PROBLEMS.find(
    (problem) => problem.title.toLowerCase() === normalizedTitle,
  );
}
