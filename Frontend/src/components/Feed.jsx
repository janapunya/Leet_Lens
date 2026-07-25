import { useContext, useState, useEffect } from 'react'
import { User_nameContext } from '../routs/CreateContext'
import FeedPost from './FeedPost'
import { FiCode, FiImage, FiSend } from 'react-icons/fi'
import axios from '../routs/Axios'
const MOCK_POSTS = [
  {
    id: 1,
    author: 'Alex Chen',
    username: 'alex_codes',
    avatarColor: '#059669',
    timeAgo: '2h ago',
    description:
      'Finally cracked Two Sum with a clean O(n) hash map approach. Sharing my solution — hope it helps someone stuck on the classic warm-up problem!',
    problemTitle: 'Two Sum',
    difficulty: 'Easy',
    language: 'javascript',
    likes: 48,
    comments: 12,
    shares: 5,
    code: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const seen = new Map();

    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }

    return [];
};`,
  },
  {
    id: 2,
    author: 'Priya Sharma',
    username: 'priya_ds',
    avatarColor: '#2563eb',
    timeAgo: '5h ago',
    description:
      'Used a monotonic stack for daily temperatures. The trick is pushing indices and popping when you find a warmer day. Took me a while to visualize!',
    problemTitle: 'Daily Temperatures',
    difficulty: 'Medium',
    language: 'python',
    likes: 92,
    comments: 24,
    shares: 11,
    code: `class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        n = len(temperatures)
        answer = [0] * n
        stack = []  # index stack

        for i, temp in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < temp:
                prev = stack.pop()
                answer[prev] = i - prev
            stack.append(i)

        return answer`,
  },
  {
    id: 3,
    author: 'Marcus Johnson',
    username: 'marcus_algo',
    avatarColor: '#7c3aed',
    timeAgo: '1d ago',
    description:
      'Trapping Rain Water with two pointers — left/right max tracking without extra arrays. One of my favorite hard problems once the pattern clicks.',
    problemTitle: 'Trapping Rain Water',
    difficulty: 'Hard',
    language: 'cpp',
    likes: 156,
    comments: 38,
    shares: 22,
    code: `class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;

        while (left < right) {
            if (height[left] < height[right]) {
                leftMax = max(leftMax, height[left]);
                water += leftMax - height[left];
                left++;
            } else {
                rightMax = max(rightMax, height[right]);
                water += rightMax - height[right];
                right--;
            }
        }

        return water;
    }
};`,
  },
  {
    id: 4,
    author: 'Sara Kim',
    username: 'sara_leet',
    avatarColor: '#db2777',
    timeAgo: '2d ago',
    description:
      'BFS level-order traversal for binary tree zigzag. Reverse every other level — simple flag toggle inside the queue loop.',
    problemTitle: 'Binary Tree Zigzag Level Order',
    difficulty: 'Medium',
    language: 'java',
    likes: 67,
    comments: 15,
    shares: 8,
    code: `class Solution {
    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        boolean leftToRight = true;

        while (!queue.isEmpty()) {
            int size = queue.size();
            LinkedList<Integer> level = new LinkedList<>();

            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                if (leftToRight) level.addLast(node.val);
                else level.addFirst(node.val);

                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }

            result.add(level);
            leftToRight = !leftToRight;
        }

        return result;
    }
}`,
  },
]

const Feed = () => {
  const { submittedUsername } = useContext(User_nameContext)
  const [feed, setFeed] = useState([])

  useEffect(() => {
    getFeed()
  }, [])

  const getFeed = async () => {
    const response = await axios.get('/execute/getfeed')
    if (response.status === 200) {
      setFeed(response.data)
    }
    else {
      toast.error(response.data.message)
    }
  }
  return (
    <section className="mx-auto w-full max-w-2xl px-3 py-4 sm:px-4 md:py-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">Community Feed</h1>
        <p className="mt-1 text-sm text-slate-400">
          Discover solutions shared by developers. Code is view-only — copy ideas, not edits.
        </p>
      </div>

      

      <div className="space-y-4 sm:space-y-5">
        {feed?.map((post) => (
          <FeedPost key={post._id} post={post} />
        ))}
      </div>
    </section>
  )
}

export default Feed
