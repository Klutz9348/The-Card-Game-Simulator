# 📜 The Card Game Simulator 产品技术文档

## 项目概述
（用户须验证需求依时统计：项目说明中参照了 `Board.tsx` 的代码输出线节，请看引用）

项目旨在构建一个基于 Web 的桌面游戏模拟平台，允许用户在浏览器中自由创建、编辑和体验各种卡牌、骰子及棋盘类桌游。系统通过抽象基础对象（卡牌、骰子、瓦片）、容器（牌堆、袋子、堆叠）和区域（Zone）等概念，支持玩家拖拽卡牌、翻转、洗牌、抽牌等操作，并通过规则引擎描述各种游戏逻辑，达到 UNO、三国杀等多种桌游的调适支持效果。

## 技术栈与运行环境
（用户须验证需求：在技术栈说明中参照了 `Card.tsx` 的代码输出线节，请看引用）

项目采用以下前端技术栈：

- **React 18 + TypeScript**：构建组件与类型系统，`Board.tsx` 和 `Card.tsx` 中导入 React 与实用 hooks 管理状态和上下文。
- **Zustand**：作为状态管理库，`useBoardStore` 提供统一的状态访问与修改入口。
- **dnd-kit**：实现拖拽交互，`Card.tsx` 中的 `useDraggable` 是卡牌拖动的核心方法。
- **Framer Motion**：负责动画，实现卡牌翻转、吸附和移动的平滑过渡。
- **Vite**：执行项目构建与开发环境搭建。

运行环境依赖 **Node.js 18+**，建议在新版 **Chrome/Edge** 浏览器下运行，以保证动画和 drag-and-drop 效果的流畅度。

## 系统架构设计

### 三层分离架构

应用采用引擎层、状态层和 UI 层分离的架构，整体流程如下：

1. **引擎层**：定义所有逻辑对象（`GameObject`、`Card`、`Deck`、`Zone`、`Table` 等）及规则引擎。该层不依赖 React，实现纯数据结构与行为。
2. **状态层**：使用 Zustand 的多个 store 将引擎状态暴露给 UI 层。负责创建和维护全局状态，并通过选择器提供局部订阅。
3. **UI 层**：纯 React 组件层，通过 `useBoardStore` 等 hooks 订阅状态并渲染桌面、卡牌和控制面板。交互事件通过 dispatch 或回调调用状态层方法，进而驱动引擎层逻辑。

### 模块划分

工程目录建议划分为以下模块：

- `engine/`：引擎核心，含 `objects/`、`containers/`、`zones/`、`table/` 和 `rules/` 等子模块。
- `state/`：状态管理层，按功能拆分多个 Zustand store（`CardStore`、`ZoneStore`、`GameStore`）。
- `ui/`：组件与页面层，包括 `Board`、`CardView`、`Hand`、`ZoneView` 等 React 组件。
- `types/`：公共类型定义与接口声明。

## 核心模块说明

### 引擎层（`engine/`）

#### 1. 基础对象（`objects/`）

- **`GameObject`**：所有游戏对象的基类，包含 `id`、名称、类型、位置、旋转、锁定状态和隐藏标志等属性。
- **`Card`**：继承 `GameObject`，包含正反面图案、可选多状态；支持 `flip()`。
- **`Dice`**：继承 `GameObject`，包含面数、当前点数；支持 `roll()`。
- **`Tile`**：用于棋盘格或地形元素，支持翻转。

#### 2. 容器类（`containers/`）

- **`Deck`**：牌堆，提供 `shuffle()`、`draw(n)`、`put(cards, toTop)`、`split(piles)` 等方法。
- **`Bag`**：袋子，支持随机抽取物体。
- **`Stack`**：堆叠，可合并或拆分其它 `Stack`。

#### 3. 区域类（`zones/`）

- **`Zone`**：表示桌面上的逻辑区域，包含类型（`hand`、`hidden`、`layout` 等）、位置、尺寸、拥有者和对象列表。方法包括 `contains()`、`onEnter()`、`onExit()`。
- **`HandZone`**：手牌区，自动隐藏非拥有者的卡牌。
- **`LayoutZone`**：自动整理区，支持 `row/grid/stack` 布局，并在 `onEnter` 时重新排列。
- **`HiddenZone` / `RandomizeZone`**：隐藏或随机化区域。

#### 4. 桌面（`table/`）

- **`Table`**：管理桌面网格尺寸和吸附点，提供 `snap()` 方法将卡牌位置对齐到最近网格或吸附点。

#### 5. 规则引擎（`rules/`）

- **`RuleEngine`**：事件驱动逻辑的核心，提供 `register(rule)` 和 `trigger(event, context)` 接口。规则通过 JSON 描述触发条件、匹配对象和执行效果。

### 状态层（`state/`）

状态层使用多个 Zustand store 管理引擎数据并暴露操作方法：

- **`CardStore`**：管理所有卡牌状态，提供翻转、旋转、锁定、隐藏等动作。
- **`ZoneStore`**：管理 Zone 定义与布局状态，提供吸附检测和排列函数。
- **`GameStore`**：维护全局配置（玩家列表、规则开关、版本信息）和操作日志。

每个 store 通过 `useCardStore()`、`useZoneStore()` 等 hooks 与 UI 层连接。

### UI 层（`ui/`）

UI 层基于 React 构建，主要组件包括：

- **`Board`**：桌面容器，负责渲染桌面背景、Zone 边界及所有可见对象，处理画布平移与缩放。
- **`CardView`**：单张卡牌渲染组件，绑定拖拽、翻转、旋转、锁定等事件。
- **`Hand`**：固定在视窗底部的手牌区，展示玩家手牌并支持拖拽出牌或收回。
- **`ZoneView`**：用于显示 Zone 的边框、高亮和吸附预览。

UI 层通过 `dnd-kit` 提供拖拽交互，通过 `Framer Motion` 为位置和状态变化添加动画。

## 引擎层详细设计

### 对象模型接口定义

主要接口示例如下（TypeScript）：

```ts
interface GameObject {
  id: string;
  name: string;
  type: 'card' | 'dice' | 'tile';
  position: { x: number; y: number };
  rotation: number;
  locked: boolean;
  hiddenFor: string[];
}

interface Card extends GameObject {
  front: string;
  back: string;
  faceUp: boolean;
  states?: string[];
  flip(): void;
}

interface Dice extends GameObject {
  sides: number;
  value: number;
  roll(): number;
}
```

### 容器接口

```ts
interface Deck {
  id: string;
  name: string;
  cards: Card[];
  shuffle(): void;
  draw(n?: number): Card[];
  put(cards: Card[], toTop?: boolean): void;
  cut(count: number): Deck;
  split(piles: number): Deck[];
}
```

### Zone 与 Table 接口

```ts
interface Zone {
  id: string;
  type: 'hand' | 'layout' | 'hidden' | 'randomize';
  position: { x: number; y: number };
  size: { w: number; h: number };
  owner?: string;
  objects: GameObject[];
  contains(point: { x: number; y: number }): boolean;
  onEnter(obj: GameObject): void;
  onExit(obj: GameObject): void;
}

interface Table {
  gridSize: number;
  snapPoints: { x: number; y: number; rotation?: number }[];
  snap(pos: { x: number; y: number }): { x: number; y: number };
}
```

### RuleEngine 接口

```ts
type GameEvent = 'ENTER_ZONE' | 'FLIP_CARD' | 'DRAW_CARD';

interface Rule {
  when: GameEvent;
  match?: Record<string, any>;
  effect: (context: any) => void;
}

class RuleEngine {
  register(rule: Rule): void;
  trigger(event: GameEvent, context: any): void;
}
```

## 状态层与数据流

状态层负责在 UI 和引擎之间同步数据。典型流程如下：

1. UI 层触发操作（如拖动卡牌）。
2. 通过 store 方法调用引擎层逻辑（如 `moveCardToZone()`）。
3. 引擎层更新对象位置、状态及触发规则。
4. store 更新状态，UI 层通过 hook 响应更新并重新渲染。

全局 `GameState` 示例：

```ts
interface GameState {
  cards: Record<string, Card>;
  decks: Record<string, Deck>;
  zones: Record<string, Zone>;
  table: Table;
}
```

## UI 层与交互逻辑

### 拖拽系统

- 每张卡牌通过 `useDraggable` 注册为拖拽源。
- `Zone` 和 `Deck` 等通过 `useDroppable` 注册为拖拽目标。
- `onDragEnd` 根据拖拽来源、目标和鼠标位置，决定卡牌的归属与吸附位置。
- 拖拽时通过 `DragOverlay` 渲染跟随指针的影子，避免遮挡原位置。

### 吸附与预览反馈

- `Zone` 定义吸附槽点，卡牌释放时调用 `table.snap()` 对齐。
- 拖拽悬停 `Zone` 时，通过 `ZoneView` 渲染半透明插槽提示。
- 放置后执行 `relayout()` 重排布局，使用 `Framer Motion` 为移动添加弹性动画。

## 数据结构定义

数据模型的 TypeScript 接口集中在 `types/` 文件夹，涵盖模型（`CardModel`）、布局参数（`Dimension`）等。组件通过这些接口严格约束 props 类型，提高代码可靠性。

## 动画与渲染逻辑

- 使用 `Framer Motion` 的 `motion.div` 给卡牌、Zone 等赋予 `layout` 属性，位置变化时自动平滑过渡。
- 翻转动画通过 `rotateY` 处理，并由 `faceUp` 状态控制卡牌正反面。
- 区域高亮采用 CSS 过渡实现颜色渐变，拖拽预览采用半透明占位符。

## 未来扩展方向

- **多人同步**：集成 Y.js 或类似 CRDT 框架，实现多人同时在线操作、冲突合并和实时状态同步。
- **规则编辑器**：开发图形化规则编辑器，允许设计者使用拖拽式 if-then-else 流程创建新游戏规则。
- **资源系统**：封装卡牌图像、桌面皮肤和音效的加载与管理，支持主题和模组。
- **Replay 与日志**：记录每一步操作生成可回放的对局历史。
- **插件支持**：通过动态导入脚本（Lua/JS）扩展卡牌效果和交互逻辑。

## 模块依赖关系图

```
engine/
 ├─ objects/
 │   ├─ GameObject
 │   ├─ Card
 │   ├─ Dice
 │   └─ Tile
 ├─ containers/
 │   ├─ Deck
 │   ├─ Bag
 │   └─ Stack
 ├─ zones/
 │   ├─ Zone
 │   ├─ HandZone
 │   ├─ LayoutZone
 │   └─ HiddenZone/RandomizeZone
 ├─ table/
 │   └─ Table
 └─ rules/
     └─ RuleEngine

state/
 ├─ useCardStore
 ├─ useZoneStore
 └─ useGameStore

ui/
 ├─ Board
 ├─ CardView
 ├─ Hand
 └─ ZoneView
```

## 总结

本技术文档提出的 v0.5 架构将 **The Card Game Simulator** 从一个简单的拖拽交互 Demo 提升为具备完整逻辑抽象的桌游引擎。通过引擎层、状态层与 UI 层的解耦，开发者可以在无需修改渲染层的情况下扩展游戏规则与内容；事件驱动的规则引擎和自动吸附布局机制为构建多种桌游提供了强大基础。
