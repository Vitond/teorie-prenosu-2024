import { AlphabetSymbol } from "./App";
import React, { useEffect, useRef, useState } from "react";

interface TreeNode {
  letter?: string;
  left?: TreeNode;
  right?: TreeNode;
}

export const buildTree = (codes: (AlphabetSymbol & { code: any })[]) => {
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

export const drawTree = (context: CanvasRenderingContext2D, root: TreeNode, startX: number, startY: number, levelGap: number, nodeGap: number, zoom?: number) => {
  if (!zoom) {
    zoom = 1;
  }
  const drawNode = (node: TreeNode, x: number, y: number) => {
    if (!node) return;
    
    const radius = 12 / zoom!;
    context.lineWidth = 1 /zoom!;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, true);
    context.fillStyle = 'rgb(144, 202, 249)';
    context.fill();
    context.strokeStyle = 'white';
    context.stroke();
    context.strokeStyle = 'rgb(144, 202, 249)';

    if (node.letter) {
      context.fillStyle = 'blue';
      context.fillText(node.letter, x - radius / 2, y + radius / 2);
    }
  }

  const fontSize = 18 / zoom
  context.font = `bold ${fontSize}px Arial`;

  const drawConnections = (node: TreeNode, x: number, y: number, xOffset: number, yOffset: number, level: number) => {
    if (node.left) {
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x - xOffset, y + yOffset / level);
      context.stroke();
      drawTree(node.left, x - xOffset, y + yOffset / level, xOffset / 2, level * 2);
    }

    if (node.right) {
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + xOffset, y + yOffset / level);
      context.stroke();
      drawTree(node.right, x + xOffset, y + yOffset / level, xOffset / 2, level * 2);
    }
  }

  const drawTree = (node: TreeNode, x: number, y: number, xOffset: number, level: number) => {
    drawNode(node, x, y);
    drawConnections(node, x, y, xOffset, levelGap, level);
  }

  drawTree(root, startX, startY, nodeGap, 1);
}

export const TreeCanvas: React.FC<{ inputData: (AlphabetSymbol & { code: any })[] }> = ({ inputData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        const treeData = buildTree(inputData);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.translate(offsetX, offsetY);
        context.scale(zoom, zoom);
        drawTree(context, treeData, canvas.width / 2, 50, 100, canvas.width / 4, zoom);
        context.restore();
      }
    }
  }, [inputData, zoom, offsetX, offsetY]);

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas!.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const zoomFactor = 1.1;
    const newZoom = event.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;

    const zoomRatio = newZoom / zoom;
    const newOffsetX = mouseX - (mouseX - offsetX) * zoomRatio;
    const newOffsetY = mouseY - (mouseY - offsetY) * zoomRatio;

    setOffsetX(newOffsetX);
    setOffsetY(newOffsetY);
    setZoom(newZoom);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    setLastX(event.clientX);
    setLastY(event.clientY);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      setOffsetX((prevOffsetX) => prevOffsetX + dx);
      setOffsetY((prevOffsetY) => prevOffsetY + dy);
      setLastX(event.clientX);
      setLastY(event.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas?.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas?.removeEventListener('wheel', handleWheel);
    }
  }, [canvasRef, handleWheel]);

  return (
    <canvas
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      ref={canvasRef}
      width={1100}
      height={500}
    />
  );
}

export default TreeCanvas;