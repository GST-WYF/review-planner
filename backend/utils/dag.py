import sqlite3
from collections import defaultdict
from typing import Dict, List, Optional, Union, Tuple


class Material:
    def __init__(self, material_id: int, title: str, type_: str, required_hours: float, reviewed_hours: float, is_completed: bool, owner_type: Optional[str] = None, owner_id: Optional[int] = None):
        self.material_id = material_id
        self.title = title
        self.type = type_  # 'note', 'video', 'recite', 'exercise_set', 'mock_exam'
        self.required_hours = required_hours
        self.reviewed_hours = reviewed_hours
        self.is_completed = is_completed
        self.owner_type = owner_type
        self.owner_id = owner_id

    def __repr__(self):
        status = "✅" if self.is_completed else "❌"
        return f"Material(ID: {self.material_id}, Type: {self.type}, Title: '{self.title}', {status}, {self.reviewed_hours}/{self.required_hours} hrs)"


class DAGNode:
    def __init__(self, node_id: int, name: str, node_type: str, priority: int = 5):
        self.node_id = node_id
        self.name = name
        self.node_type = node_type  # 'exam', 'subject', 'topic'
        self.priority = priority
        self.children: List['DAGNode'] = []
        self.inputs: List[Material] = []
        self.outputs: List[Material] = []
        self.unfinished_children_count = 0
        self.unfinished_inputs_count = 0
        self.unfinished_outputs_count = 0
        self.parent: Optional['DAGNode'] = None

    def add_child(self, child: 'DAGNode'):
        self.children.append(child)
        child.parent = self

    def add_input(self, material: Material):
        self.inputs.append(material)
        if not material.is_completed:
            self.unfinished_inputs_count += 1

    def add_output(self, material: Material):
        self.outputs.append(material)
        if not material.is_completed:
            self.unfinished_outputs_count += 1

    @property
    def is_completed(self) -> bool:
        return (
            self.unfinished_children_count == 0 and
            self.unfinished_inputs_count == 0 and
            self.unfinished_outputs_count == 0
        )

    def __repr__(self):
        return f"DAGNode({self.node_type}:{self.node_id}, '{self.name}', priority={self.priority})"


class DAG:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.exam_nodes: Dict[int, DAGNode] = {}
        self.subject_nodes: Dict[int, DAGNode] = {}
        self.topic_nodes: Dict[int, DAGNode] = {}
        self.last_exam_id: Optional[int] = None
        self.last_subject_id: Optional[int] = None
        self._load_from_db()
        self._update_unfinished_children_count()

    def _load_from_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            cursor.execute("SELECT exam_id, exam_name, priority FROM Exam")
            for exam_id, exam_name, priority in cursor.fetchall():
                self.exam_nodes[exam_id] = DAGNode(exam_id, exam_name, 'exam', priority)

            cursor.execute("SELECT subject_id, exam_id, subject_name, priority FROM Subject")
            for subject_id, exam_id, subject_name, priority in cursor.fetchall():
                subject_node = DAGNode(subject_id, subject_name, 'subject', priority)
                self.subject_nodes[subject_id] = subject_node
                if exam_id in self.exam_nodes:
                    self.exam_nodes[exam_id].add_child(subject_node)

            cursor.execute("SELECT topic_id, subject_id, parent_id, name, importance FROM TopicNode")
            temp_topics = {}
            for topic_id, subject_id, parent_id, name, importance in cursor.fetchall():
                topic_node = DAGNode(topic_id, name, 'topic', importance)
                temp_topics[topic_id] = (topic_node, subject_id, parent_id)
                self.topic_nodes[topic_id] = topic_node

            for topic_id, (node, subject_id, parent_id) in temp_topics.items():
                if parent_id:
                    parent_node = self.topic_nodes.get(parent_id)
                    if parent_node:
                        parent_node.add_child(node)
                else:
                    subject_node = self.subject_nodes.get(subject_id)
                    if subject_node:
                        subject_node.add_child(node)

            cursor.execute("SELECT input_id, topic_id, type, title, required_hours, reviewed_hours, is_completed FROM InputMaterial")
            for input_id, topic_id, type_, title, req_hrs, rev_hrs, is_completed in cursor.fetchall():
                node = self.topic_nodes.get(topic_id)
                if node:
                    material = Material(input_id, title, type_, req_hrs, rev_hrs, bool(is_completed), 'topic', topic_id)
                    node.add_input(material)

            cursor.execute("SELECT output_id, owner_type, owner_id, type, title, required_hours, reviewed_hours, is_completed FROM OutputMaterial")
            for output_id, owner_type, owner_id, type_, title, req_hrs, rev_hrs, is_completed in cursor.fetchall():
                material = Material(output_id, title, type_, req_hrs, rev_hrs, bool(is_completed), owner_type, owner_id)
                if owner_type == 'exam':
                    node = self.exam_nodes.get(owner_id)
                elif owner_type == 'subject':
                    node = self.subject_nodes.get(owner_id)
                else:
                    node = self.topic_nodes.get(owner_id)
                if node:
                    node.add_output(material)

    def _update_unfinished_children_count(self):
        def update_node(node: DAGNode):
            count = 0
            for child in node.children:
                update_node(child)
                if not child.is_completed:
                    count += 1
            node.unfinished_children_count = count

        for exam_node in self.exam_nodes.values():
            update_node(exam_node)

    def update_task(self, material: Material, study_hours: float):
        if material.is_completed:
            return
        material.reviewed_hours += study_hours
        if material.reviewed_hours >= material.required_hours:
            material.reviewed_hours = material.required_hours
            material.is_completed = True
            if material.owner_type == 'exam':
                node = self.exam_nodes.get(material.owner_id)
            elif material.owner_type == 'subject':
                node = self.subject_nodes.get(material.owner_id)
            else:
                node = self.topic_nodes.get(material.owner_id)
            if node:
                if material in node.inputs:
                    node.unfinished_inputs_count -= 1
                if material in node.outputs:
                    node.unfinished_outputs_count -= 1
                self._propagate_completion(node)

    def _propagate_completion(self, node: DAGNode):
        while node:
            node.unfinished_children_count = sum(1 for child in node.children if not child.is_completed)
            node = node.parent

    def select_next_exam(self) -> Optional[DAGNode]:
        candidates = [e for e in self.exam_nodes.values() if not e.is_completed and e.priority > 0]
        if not candidates:
            return None
        max_priority = max(e.priority for e in candidates)
        candidates = [e for e in candidates if e.priority == max_priority]
        candidates.sort(key=lambda x: x.node_id)
        ids = [e.node_id for e in candidates]
        if self.last_exam_id and self.last_exam_id in ids:
            idx = ids.index(self.last_exam_id)
            next_exam = candidates[(idx + 1) % len(candidates)]
        else:
            next_exam = candidates[0]
        self.last_exam_id = next_exam.node_id
        return next_exam

    def select_next_subject(self, exam_node: DAGNode) -> Optional[DAGNode]:
        candidates = [s for s in exam_node.children if not s.is_completed and s.priority > 0]
        if not candidates:
            return None
        max_priority = max(s.priority for s in candidates)
        candidates = [s for s in candidates if s.priority == max_priority]
        candidates.sort(key=lambda x: x.node_id)
        ids = [s.node_id for s in candidates]
        if self.last_subject_id and self.last_subject_id in ids:
            idx = ids.index(self.last_subject_id)
            next_subject = candidates[(idx + 1) % len(candidates)]
        else:
            next_subject = candidates[0]
        self.last_subject_id = next_subject.node_id
        return next_subject

    def get_next_task(self, exam_node: DAGNode, subject_node: Optional[DAGNode], types: Tuple[str], max_hours: float) -> Optional[Material]:
        def dfs(node: DAGNode) -> Optional[Material]:
            for material in node.inputs:
                if not material.is_completed and material.type in types:
                    if material.type == 'mock_exam' and material.required_hours > max_hours:
                        continue
                    return material
            sorted_children = sorted(node.children, key=lambda n: (-n.priority, n.node_id))
            for child in sorted_children:
                result = dfs(child)
                if result:
                    return result
            if node.unfinished_children_count == 0 and node.unfinished_inputs_count == 0:
                for material in node.outputs:
                    if not material.is_completed and material.type in types:
                        if material.type == 'mock_exam' and material.required_hours > max_hours:
                            continue
                        return material
            return None

        if subject_node:
            result = dfs(subject_node)
            if result:
                return result

        if exam_node.unfinished_children_count == 0 and exam_node.unfinished_inputs_count == 0:
            for material in exam_node.outputs:
                if not material.is_completed and material.type in types:
                    if material.type == 'mock_exam' and material.required_hours > max_hours:
                        continue
                    return material
        # print("没有找到符合条件的任务！")
        return None

    def print_dag(self):
        for exam_node in self.exam_nodes.values():
            self._print_node(exam_node, indent=0)

    def _print_node(self, node: DAGNode, indent: int):
        prefix = "  " * indent
        status = "✅" if node.is_completed else "❌"
        print(f"{prefix}- {node.name} ({node.node_type}, ID: {node.node_id}, Priority: {node.priority}) {status}")
        if node.unfinished_children_count > 0:
            print(f"{prefix}  Unfinished children: {node.unfinished_children_count}")
        if node.unfinished_inputs_count > 0:
            print(f"{prefix}  Unfinished inputs: {node.unfinished_inputs_count}")
        if node.unfinished_outputs_count > 0:
            print(f"{prefix}  Unfinished outputs: {node.unfinished_outputs_count}")
        for child in node.children:
            self._print_node(child, indent + 1)


if __name__ == "__main__":
    dag = DAG("/home/Matrix/review-planner/backend/review_plan.db")
    dag.print_dag()

    print("\n🔄 更新任务状态示例:")
    # next_exam = dag.select_next_exam()
    next_exam = dag.exam_nodes[2]
    next_subject = dag.select_next_subject(next_exam)
    # next_subject = dag.select_next_subject(next_exam)
    if next_exam:
        task = dag.get_next_task(next_exam, next_subject, types=("note", "video", "mock_exam"), max_hours=2.0)
        if task:
            print(f"\n➡️ 学习材料: {task}")
            dag.update_task(task, 2.0)

    dag.print_dag()

    print("\n📘 下一个考试:")
    print(next_exam)

    print("\n📗 下一个科目:")
    print(next_subject)

    print("\n🧠 获取下一个任务:")
    # if next_exam and next_subject:
    task = dag.get_next_task(next_exam, next_subject, types=('note', 'video', 'recite', 'exercise_set', 'mock_exam'), max_hours=0.5)
    print(task)
    task = dag.get_next_task(dag.exam_nodes[2], dag.subject_nodes[12], types=("note", "video", "mock_exam"), max_hours=0.5)
    print(task)
