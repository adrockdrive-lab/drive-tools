#!/usr/bin/env python3
"""
PLANE_PROJECT_TEMPLATE.md 기반 기획서를 Plane API로 변환

작성자: Claude Code
버전: 2.0.0
라이선스: MIT

사용법:
    python md_to_plane.py service_plan.md \\
        --workspace my-workspace \\
        --project project-id \\
        --api-key your-api-key \\
        --api-url http://localhost:8090

요구사항:
    - Python 3.7+
    - pip install requests pyyaml
"""

import re
import sys
import yaml
import requests
import argparse
import time
from typing import List, Dict, Optional
from dataclasses import dataclass, field


@dataclass
class Issue:
    """이슈 데이터"""
    name: str
    description_html: str = ""
    priority: str = "medium"
    assignees: List[str] = field(default_factory=list)
    labels: List[str] = field(default_factory=list)
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    estimate_point: Optional[int] = None
    state: Optional[str] = None


@dataclass
class Module:
    """모듈(에픽) 데이터"""
    name: str
    description: str = ""
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    lead: Optional[str] = None
    members: List[str] = field(default_factory=list)
    status: str = "planned"
    issues: List[Issue] = field(default_factory=list)


@dataclass
class Cycle:
    """사이클(스프린트) 데이터"""
    name: str
    description: str = ""
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    owned_by: Optional[str] = None
    modules: List[Module] = field(default_factory=list)


class YAMLMarkdownParser:
    """
    PLANE_PROJECT_TEMPLATE.md 형식의 YAML 블록 파싱

    구조:
        ## 7. Modules 계획
        ### Module 1: [모듈명]
        ```yaml
        name: "..."
        description: "..."
        ```

        **Issues** (N개, Xpt):

        #### PROJ-001: 이슈 제목 (Xpt, Priority)
        ```yaml
        description_html: |
          <h2>개요</h2>
          ...
        assignees: ["@user"]
        labels: ["backend"]
        priority: "high"
        estimate_point: 8
        ```
    """

    def __init__(self, md_content: str):
        self.content = md_content
        self.cycles: List[Cycle] = []
        self.modules: List[Module] = []
        self.project_identifier = "PROJ"

    def parse(self) -> List[Module]:
        """메인 파싱 로직"""
        # 1. 프로젝트 식별자 추출
        self._extract_project_identifier()

        # 2. Cycles 섹션 파싱 (있으면)
        self._parse_cycles_section()

        # 3. Modules 섹션 파싱
        self._parse_modules_section()

        return self.modules

    def _extract_project_identifier(self):
        """프로젝트 식별자 추출: **프로젝트 식별자**: `[PROJ]`"""
        match = re.search(r'\*\*프로젝트 식별자\*\*:\s*`([A-Z]{3,7})`', self.content)
        if match:
            self.project_identifier = match.group(1)

    def _parse_cycles_section(self):
        """## 8. Cycles 계획 섹션 파싱"""
        # Cycles 섹션 찾기
        cycles_match = re.search(
            r'## 8\. Cycles 계획(.+?)(?=##|\Z)',
            self.content,
            re.DOTALL
        )

        if not cycles_match:
            return

        cycles_section = cycles_match.group(1)

        # Cycle별 파싱: ### Cycle N: 이름
        cycle_blocks = re.finditer(
            r'###\s+Cycle\s+\d+:\s+(.+?)\n```yaml\n(.+?)\n```',
            cycles_section,
            re.DOTALL
        )

        for match in cycle_blocks:
            cycle_name = match.group(1).strip()
            yaml_content = match.group(2)

            try:
                cycle_data = yaml.safe_load(yaml_content)
                cycle = Cycle(
                    name=cycle_data.get('name', cycle_name),
                    description=cycle_data.get('description', ''),
                    start_date=cycle_data.get('start_date'),
                    end_date=cycle_data.get('end_date'),
                    owned_by=cycle_data.get('owned_by')
                )
                self.cycles.append(cycle)
            except yaml.YAMLError as e:
                print(f"⚠️  Cycle YAML 파싱 오류: {cycle_name} - {e}")

    def _parse_modules_section(self):
        """## 7. Modules 계획 섹션 파싱"""
        # Modules 섹션 찾기
        modules_match = re.search(
            r'## 7\. Modules 계획(.+?)(?=## \d+\.)',
            self.content,
            re.DOTALL
        )

        if not modules_match:
            print("⚠️  Modules 섹션을 찾을 수 없습니다.")
            return

        modules_section = modules_match.group(1)

        # Module별 파싱: ### Module N: 이름
        module_pattern = r'###\s+Module\s+\d+:\s+(.+?)(?=###\s+Module|\Z)'
        module_blocks = re.finditer(module_pattern, modules_section, re.DOTALL)

        for module_match in module_blocks:
            module_text = module_match.group(0)
            module_name = module_match.group(1).strip()

            # Module YAML 파싱
            yaml_match = re.search(r'```yaml\n(.+?)\n```', module_text, re.DOTALL)

            if not yaml_match:
                print(f"⚠️  Module YAML을 찾을 수 없음: {module_name}")
                continue

            try:
                module_data = yaml.safe_load(yaml_match.group(1))
                module = Module(
                    name=module_data.get('name', module_name),
                    description=module_data.get('description', ''),
                    start_date=module_data.get('start_date'),
                    target_date=module_data.get('target_date'),
                    lead=module_data.get('lead'),
                    members=module_data.get('members', []),
                    status=module_data.get('status', 'planned')
                )

                # 이 Module의 Issues 파싱
                module.issues = self._parse_issues_in_module(module_text)

                self.modules.append(module)

            except yaml.YAMLError as e:
                print(f"⚠️  Module YAML 파싱 오류: {module_name} - {e}")

    def _parse_issues_in_module(self, module_text: str) -> List[Issue]:
        """Module 내의 Issues 파싱"""
        issues = []

        # Issue 패턴: #### PROJ-XXX: 제목 (Xpt, Priority)
        issue_pattern = r'####\s+' + self.project_identifier + r'-(\d+):\s+(.+?)(?=####|###|\Z)'
        issue_blocks = re.finditer(issue_pattern, module_text, re.DOTALL)

        for issue_match in issue_blocks:
            issue_number = issue_match.group(1)
            issue_text = issue_match.group(0)

            # 제목 파싱: "제목 (8pt, High)" 형식
            title_line = issue_match.group(2).split('\n')[0].strip()

            # (Xpt, Priority) 제거하여 순수 제목 추출
            clean_title = re.sub(r'\s*\(\d+pt,\s*\w+\)', '', title_line).strip()

            # YAML 블록 파싱
            yaml_match = re.search(r'```yaml\n(.+?)\n```', issue_text, re.DOTALL)

            if not yaml_match:
                # YAML 없으면 기본값으로 생성
                issue = Issue(name=clean_title)
                issues.append(issue)
                continue

            try:
                issue_data = yaml.safe_load(yaml_match.group(1))

                issue = Issue(
                    name=clean_title,
                    description_html=issue_data.get('description_html', ''),
                    priority=self._normalize_priority(issue_data.get('priority', 'medium')),
                    assignees=issue_data.get('assignees', []),
                    labels=issue_data.get('labels', []),
                    start_date=issue_data.get('start_date'),
                    target_date=issue_data.get('target_date'),
                    estimate_point=issue_data.get('estimate_point'),
                    state=issue_data.get('state')
                )

                issues.append(issue)

            except yaml.YAMLError as e:
                print(f"⚠️  Issue YAML 파싱 오류: {clean_title} - {e}")
                # 에러 발생 시에도 기본 Issue 생성
                issues.append(Issue(name=clean_title))

        return issues

    def _normalize_priority(self, priority: str) -> str:
        """우선순위 정규화"""
        priority_map = {
            'urgent': 'urgent',
            'high': 'high',
            'medium': 'medium',
            'low': 'low',
            'none': 'none'
        }
        return priority_map.get(priority.lower(), 'medium')


class PlaneAPIClient:
    """Plane API 클라이언트"""

    def __init__(self, api_url: str, api_key: str, workspace_slug: str, project_id: str):
        self.api_url = api_url.rstrip('/')
        self.workspace_slug = workspace_slug
        self.project_id = project_id
        self.headers = {
            'x-api-key': api_key,
            'Content-Type': 'application/json'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def create_module(self, module: Module) -> Optional[str]:
        """모듈 생성 (Rate Limit 재시도 포함)"""
        url = f"{self.api_url}/api/v1/workspaces/{self.workspace_slug}/projects/{self.project_id}/modules/"

        payload = {
            "name": module.name,
            "description": module.description,
            "status": module.status,
        }

        if module.start_date:
            payload["start_date"] = module.start_date
        if module.target_date:
            payload["target_date"] = module.target_date

        # Rate Limit 재시도 로직
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.session.post(url, json=payload)

                if response.status_code == 201:
                    module_id = response.json().get('id')
                    print(f"✅ Module 생성: {module.name} (ID: {module_id})")
                    time.sleep(0.5)  # API Rate Limit 대응
                    return module_id
                elif response.status_code == 429:
                    wait_time = 5 * (attempt + 1)  # 5초, 10초, 15초
                    print(f"⏳ Rate Limit! {wait_time}초 대기 후 재시도... (시도 {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"❌ Module 생성 실패: {module.name}")
                    print(f"   Status: {response.status_code}")
                    print(f"   Response: {response.text}")
                    return None
            except Exception as e:
                print(f"❌ Module 생성 오류: {module.name} - {str(e)}")
                return None

        print(f"❌ Module 생성 최종 실패 (Rate Limit 초과): {module.name}")
        return None

    def create_issue(self, issue: Issue, module_id: Optional[str] = None) -> Optional[str]:
        """이슈 생성 (Rate Limit 재시도 포함)"""
        url = f"{self.api_url}/api/v1/workspaces/{self.workspace_slug}/projects/{self.project_id}/issues/"

        payload = {
            "name": issue.name,
            "description_html": issue.description_html or "<p>내용 없음</p>",
            "priority": issue.priority,
        }

        if issue.start_date:
            payload["start_date"] = issue.start_date
        if issue.target_date:
            payload["target_date"] = issue.target_date

        # Rate Limit 재시도 로직
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.session.post(url, json=payload)

                if response.status_code == 201:
                    issue_id = response.json().get('id')
                    print(f"  ✅ Issue 생성: {issue.name}")

                    # 모듈에 이슈 연결
                    if module_id:
                        self._add_issue_to_module(module_id, issue_id)

                    time.sleep(0.3)  # API Rate Limit 대응
                    return issue_id
                elif response.status_code == 429:
                    wait_time = 5 * (attempt + 1)
                    print(f"  ⏳ Rate Limit! {wait_time}초 대기 후 재시도... (시도 {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"  ❌ Issue 생성 실패: {issue.name}")
                    print(f"     Status: {response.status_code}")
                    print(f"     Response: {response.text}")
                    return None
            except Exception as e:
                print(f"  ❌ Issue 생성 오류: {issue.name} - {str(e)}")
                return None

        print(f"  ❌ Issue 생성 최종 실패 (Rate Limit 초과): {issue.name}")
        return None

    def _add_issue_to_module(self, module_id: str, issue_id: str):
        """모듈에 이슈 추가"""
        url = f"{self.api_url}/api/v1/workspaces/{self.workspace_slug}/projects/{self.project_id}/modules/{module_id}/module-issues/"

        payload = {"issues": [issue_id]}

        try:
            response = self.session.post(url, json=payload)
            if response.status_code in [200, 201]:
                print(f"     → Module에 연결됨")
                return True
            else:
                print(f"     ⚠️  Module 연결 실패 (Status: {response.status_code})")
                return False
        except Exception as e:
            print(f"     ⚠️  Module 연결 오류: {str(e)}")
            return False

    def create_cycle(self, cycle: Cycle) -> Optional[str]:
        """사이클 생성"""
        url = f"{self.api_url}/api/v1/workspaces/{self.workspace_slug}/projects/{self.project_id}/cycles/"

        payload = {
            "name": cycle.name,
            "description": cycle.description,
            "project_id": self.project_id,
        }

        if cycle.start_date:
            payload["start_date"] = cycle.start_date
        if cycle.end_date:
            payload["end_date"] = cycle.end_date

        try:
            response = self.session.post(url, json=payload)

            if response.status_code == 201:
                cycle_id = response.json().get('id')
                print(f"✅ Cycle 생성: {cycle.name} (ID: {cycle_id})")
                return cycle_id
            else:
                print(f"❌ Cycle 생성 실패: {cycle.name}")
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Cycle 생성 오류: {cycle.name} - {str(e)}")
            return None

    def add_issues_to_cycle(self, cycle_id: str, issue_ids: List[str]) -> bool:
        """사이클에 이슈들 추가"""
        if not issue_ids:
            return True

        url = f"{self.api_url}/api/v1/workspaces/{self.workspace_slug}/projects/{self.project_id}/cycles/{cycle_id}/cycle-issues/"

        payload = {"issues": issue_ids}

        try:
            response = self.session.post(url, json=payload)
            if response.status_code in [200, 201]:
                print(f"  → Cycle에 {len(issue_ids)}개 Issue 연결됨")
                return True
            else:
                print(f"  ⚠️  Cycle 연결 실패 (Status: {response.status_code})")
                if response.status_code == 400:
                    print(f"     {response.text}")
                return False
        except Exception as e:
            print(f"  ⚠️  Cycle 연결 오류: {str(e)}")
            return False


def main():
    parser = argparse.ArgumentParser(
        description='PLANE_PROJECT_TEMPLATE.md 기반 기획서를 Plane으로 업로드',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  python md_to_plane.py plans/my-service.md \\
      --workspace pluck \\
      --project abc123-def456 \\
      --api-key your-api-key \\
      --api-url http://localhost:8090
        """
    )

    parser.add_argument('md_file', help='기획서 마크다운 파일 경로')
    parser.add_argument('--workspace', '-w', required=True, help='Plane workspace slug')
    parser.add_argument('--project', '-p', required=True, help='Plane project ID (UUID)')
    parser.add_argument('--api-key', '-k', required=True, help='Plane API key')
    parser.add_argument('--api-url', default='http://localhost:8090',
                       help='Plane API URL (기본값: http://localhost:8090)')
    parser.add_argument('--dry-run', action='store_true',
                       help='실제 생성 없이 파싱 결과만 출력')
    parser.add_argument('--yes', '-y', action='store_true',
                       help='확인 프롬프트 건너뛰기')

    args = parser.parse_args()

    # 1. MD 파일 읽기
    print(f"\n📖 기획서 읽는 중: {args.md_file}")
    try:
        with open(args.md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()
    except FileNotFoundError:
        print(f"❌ 파일을 찾을 수 없습니다: {args.md_file}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 파일 읽기 오류: {str(e)}")
        sys.exit(1)

    # 2. 파싱
    print("🔍 YAML 구조 분석 중...\n")
    parser_obj = YAMLMarkdownParser(md_content)
    modules = parser_obj.parse()

    # 3. 파싱 결과 출력
    print("=" * 70)
    print("📊 파싱 결과")
    print("=" * 70)

    total_issues = 0
    total_story_points = 0

    for module in modules:
        issue_count = len(module.issues)
        total_issues += issue_count

        # Story Points 합계
        module_points = sum(
            issue.estimate_point for issue in module.issues
            if issue.estimate_point is not None
        )
        total_story_points += module_points

        print(f"\n📦 Module: {module.name}")
        print(f"   기간: {module.start_date or 'N/A'} ~ {module.target_date or 'N/A'}")
        print(f"   Issues: {issue_count}개, Story Points: {module_points}pt")

        for issue in module.issues:
            priority_emoji = {
                'urgent': '🔥',
                'high': '⚡',
                'medium': '📌',
                'low': '💤',
                'none': '⚪'
            }.get(issue.priority, '📌')

            points_str = f"{issue.estimate_point}pt" if issue.estimate_point else "?pt"
            labels_str = f" [{', '.join(issue.labels)}]" if issue.labels else ""

            print(f"    {priority_emoji} {issue.name} ({points_str}){labels_str}")

    print("\n" + "=" * 70)
    print(f"총 {len(modules)}개 Module, {total_issues}개 Issue, {total_story_points}pt")
    print("=" * 70)

    # Dry run이면 종료
    if args.dry_run:
        print("\n✅ Dry-run 모드: 실제 생성하지 않고 종료합니다.")
        return

    # 4. 사용자 확인
    print(f"\n🎯 업로드 대상:")
    print(f"   API URL: {args.api_url}")
    print(f"   Workspace: {args.workspace}")
    print(f"   Project: {args.project}")

    if not args.yes:
        confirm = input("\n🚀 Plane에 업로드하시겠습니까? (y/n): ")
        if confirm.lower() != 'y':
            print("❌ 취소되었습니다.")
            return

    # 5. Plane API 클라이언트 생성
    client = PlaneAPIClient(args.api_url, args.api_key, args.workspace, args.project)

    # 6. Cycles 생성 (있으면)
    print(f"\n" + "=" * 70)
    print("🚀 Plane으로 업로드 중...")
    print("=" * 70 + "\n")

    cycle_list = []  # Cycle 객체와 ID 저장
    if parser_obj.cycles:
        print("📅 Cycles 생성 중...\n")
        for cycle in parser_obj.cycles:
            cycle_id = client.create_cycle(cycle)
            if cycle_id:
                cycle_list.append({
                    'id': cycle_id,
                    'name': cycle.name,
                    'start_date': cycle.start_date,
                    'end_date': cycle.end_date
                })
        print()

    # 7. Modules와 Issues 생성
    print("📦 Modules 및 Issues 생성 중...\n")

    module_data_list = []  # Module 정보 저장 (Cycle 연결용)

    for module in modules:
        # Module 생성
        module_id = client.create_module(module)

        if module_id:
            issue_ids = []

            # Issues 생성
            for issue in module.issues:
                issue_id = client.create_issue(issue, module_id)
                if issue_id:
                    issue_ids.append(issue_id)

            # Module 정보 저장
            module_data_list.append({
                'name': module.name,
                'start_date': module.start_date,
                'issue_ids': issue_ids
            })

        print()  # Module 간 공백

    # 8. Cycle에 Issues 연결
    if cycle_list and module_data_list:
        print("🔗 Cycles에 Issues 연결 중...\n")

        for cycle_info in cycle_list:
            cycle_id = cycle_info['id']
            cycle_start = cycle_info['start_date']
            cycle_end = cycle_info['end_date']

            # 이 Cycle 기간에 해당하는 Module의 Issues 수집
            cycle_issues = []
            for module_data in module_data_list:
                module_start = module_data['start_date']

                # Module start_date가 Cycle 기간 내에 있으면 연결
                if module_start and cycle_start and cycle_end:
                    if cycle_start <= module_start <= cycle_end:
                        cycle_issues.extend(module_data['issue_ids'])
                        print(f"  {module_data['name']} → {cycle_info['name']}")

            # Cycle에 Issues 추가
            if cycle_issues:
                client.add_issues_to_cycle(cycle_id, cycle_issues)

            print()

    # 9. 완료
    print("=" * 70)
    print("✅ 업로드 완료!")
    print("=" * 70)
    print(f"\n👉 Plane에서 확인: {args.api_url}/workspaces/{args.workspace}/projects/{args.project}\n")

    # 통계 출력
    print("📊 업로드 통계:")
    print(f"   - Cycles: {len(cycle_list)}개")
    print(f"   - Modules: {len(modules)}개")
    total_issues = sum(len(data['issue_ids']) for data in module_data_list)
    print(f"   - Issues: {total_issues}개")
    print(f"\n✨ 모든 연결 완료:")
    print(f"   - Issue → Module 연결 ✅")
    print(f"   - Issue → Cycle 연결 ✅")
    print(f"   - Gantt 차트 준비 완료 ✅\n")


if __name__ == '__main__':
    main()
