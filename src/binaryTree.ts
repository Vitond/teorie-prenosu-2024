import { AlphabetSymbol } from "./App";

interface TreeNode {
    letter?: string;
    left?: TreeNode;
    right?: TreeNode;
}

export const buildTree = (codes: (AlphabetSymbol & {code: any})[]) => {
    const root: TreeNode = {};
  
    codes.forEach(({ value, code }) => {
      let current = root;
  
      for (const bit of code!) {
        if (bit === '0') {
          if (!current.left) {
            current.left = {};
          }
          current = current.left;
        } else if (bit === '1') {
          if (!current.right) {
            current.right = {};
          }
          current = current.right;
        }
      }
  
      current.letter = value;
    });
  
    return root;
  }

export const drawTree = (context: CanvasRenderingContext2D, root: TreeNode, startX: number, startY: number, levelGap: number, nodeGap: number) => {
    const drawNode = (node: TreeNode, x: number, y: number) => {
        if (!node) return;

        const radius = 10;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, true);
        context.fillStyle = 'white';
        context.fill();
        context.strokeStyle = 'black';
        context.stroke();

        if (node.letter) {
            context.fillStyle = 'black';
            context.fillText(node.letter, x - radius / 2, y + radius / 2);
        }
    }

    const drawConnections = (node: TreeNode, x: number, y: number, xOffset: number, yOffset: number) => {
        if (node.left) {
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x - xOffset, y + yOffset);
            context.stroke();
            drawTree(node.left, x - xOffset, y + yOffset, xOffset / 2);
        }

        if (node.right) {
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + xOffset, y + yOffset);
            context.stroke();
            drawTree(node.right, x + xOffset, y + yOffset, xOffset / 2);
        }
    }

    const drawTree = (node: TreeNode, x: number, y: number, xOffset: number) => {
        drawNode(node, x, y);
        drawConnections(node, x, y, xOffset, levelGap);
    }

    drawTree(root, startX, startY, nodeGap);
}