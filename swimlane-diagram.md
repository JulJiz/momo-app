# MOMO Swimlane Diagram

Paste the XML inside the code block into draw.io using Arrange > Insert > Advanced > XML.

```xml
<mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="920" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />

    <mxCell id="laneTeacher" value="Teacher Dashboard" style="swimlane;whiteSpace=wrap;html=1;startSize=30;horizontal=0;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
      <mxGeometry x="20" y="20" width="180" height="860" as="geometry" />
    </mxCell>
    <mxCell id="laneStudent" value="Student Client" style="swimlane;whiteSpace=wrap;html=1;startSize=30;horizontal=0;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
      <mxGeometry x="210" y="20" width="180" height="860" as="geometry" />
    </mxCell>
    <mxCell id="laneScreen" value="Screen / Projector" style="swimlane;whiteSpace=wrap;html=1;startSize=30;horizontal=0;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
      <mxGeometry x="400" y="20" width="180" height="860" as="geometry" />
    </mxCell>
    <mxCell id="laneServer" value="Express + Socket.io Server" style="swimlane;whiteSpace=wrap;html=1;startSize=30;horizontal=0;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1">
      <mxGeometry x="590" y="20" width="200" height="860" as="geometry" />
    </mxCell>
    <mxCell id="laneDb" value="Supabase Database" style="swimlane;whiteSpace=wrap;html=1;startSize=30;horizontal=0;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1">
      <mxGeometry x="800" y="20" width="180" height="860" as="geometry" />
    </mxCell>
    <mxCell id="laneAi" value="MOMO Assistant" style="swimlane;whiteSpace=wrap;html=1;startSize=30;horizontal=0;fillColor=#ffe6cc;strokeColor=#d79b00;" vertex="1" parent="1">
      <mxGeometry x="990" y="20" width="180" height="860" as="geometry" />
    </mxCell>

    <mxCell id="t1" value="Open teacher page" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d6b656;" vertex="1" parent="laneTeacher">
      <mxGeometry x="35" y="45" width="120" height="50" as="geometry" />
    </mxCell>
    <mxCell id="t2" value="Create session" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d6b656;" vertex="1" parent="laneTeacher">
      <mxGeometry x="35" y="130" width="120" height="50" as="geometry" />
    </mxCell>
    <mxCell id="s1" value="POST /session/create" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#b85450;" vertex="1" parent="laneServer">
      <mxGeometry x="40" y="130" width="130" height="50" as="geometry" />
    </mxCell>
    <mxCell id="db1" value="Upsert session row" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#9673a6;" vertex="1" parent="laneDb">
      <mxGeometry x="35" y="130" width="120" height="50" as="geometry" />
    </mxCell>
    <mxCell id="t3" value="Show code and controls" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d6b656;" vertex="1" parent="laneTeacher">
      <mxGeometry x="35" y="215" width="120" height="50" as="geometry" />
    </mxCell>

    <mxCell id="p1" value="Open projector page" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6c8ebf;" vertex="1" parent="laneScreen">
      <mxGeometry x="35" y="215" width="120" height="50" as="geometry" />
    </mxCell>
    <mxCell id="p2" value="Socket join-session role screen" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6c8ebf;" vertex="1" parent="laneScreen">
      <mxGeometry x="35" y="300" width="120" height="60" as="geometry" />
    </mxCell>
    <mxCell id="srvScreen" value="Join screen room session:code:screen" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#b85450;" vertex="1" parent="laneServer">
      <mxGeometry x="40" y="300" width="130" height="60" as="geometry" />
    </mxCell>

    <mxCell id="st1" value="Open student page" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#82b366;" vertex="1" parent="laneStudent">
      <mxGeometry x="35" y="215" width="120" height="50" as="geometry" />
    </mxCell>
    <mxCell id="st2" value="Enter code, name and join" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#82b366;" vertex="1" parent="laneStudent">
      <mxGeometry x="35" y="300" width="120" height="60" as="geometry" />
    </mxCell>
    <mxCell id="srvJoin" value="POST /session/join validates code" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#b85450;" vertex="1" parent="laneServer">
      <mxGeometry x="40" y="400" width="130" height="60" as="geometry" />
    </mxCell>
    <mxCell id="dbStudent" value="Upsert students row" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#9673a6;" vertex="1" parent="laneDb">
      <mxGeometry x="35" y="400" width="120" height="50" as="geometry" />
    </mxCell>
    <mxCell id="condCode" value="Invalid code?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#b85450;" vertex="1" parent="laneServer">
      <mxGeometry x="55" y="480" width="100" height="70" as="geometry" />
    </mxCell>
    <mxCell id="stErr" value="Show error and keep join form" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#82b366;" vertex="1" parent="laneStudent">
      <mxGeometry x="35" y="495" width="120" height="60" as="geometry" />
    </mxCell>

    <mxCell id="tStart" value="Start / pause / end" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d6b656;" vertex="1" parent="laneTeacher">
      <mxGeometry x="35" y="390" width="120" height="60" as="geometry" />
    </mxCell>
    <mxCell id="tNewSession" value="If ended, create new clean session" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d6b656;" vertex="1" parent="laneTeacher">
      <mxGeometry x="35" y="465" width="120" height="60" as="geometry" />
    </mxCell>
    <mxCell id="srvControl" value="POST /session/control updates timer" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#b85450;" vertex="1" parent="laneServer">
      <mxGeometry x="40" y="575" width="130" height="60" as="geometry" />
    </mxCell>
    <mxCell id="dbSessionUpdate" value="Persist session status" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#9673a6;" vertex="1" parent="laneDb">
      <mxGeometry x="35" y="575" width="120" height="50" as="geometry" />
    </mxCell>
    <mxCell id="srvState" value="Emit session-state to rooms" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#b85450;" vertex="1" parent="laneServer">
      <mxGeometry x="40" y="655" width="130" height="60" as="geometry" />
    </mxCell>

    <mxCell id="stDraw" value="Draw or move phone" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#82b366;" vertex="1" parent="laneStudent">
      <mxGeometry x="35" y="645" width="120" height="50" as="geometry" />
    </mxCell>
    <mxCell id="condActive" value="Session active?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#b85450;" vertex="1" parent="laneServer">
      <mxGeometry x="55" y="735" width="100" height="70" as="geometry" />
    </mxCell>
    <mxCell id="srvDraw" value="Validate draw/sensor event" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#b85450;" vertex="1" parent="laneServer">
      <mxGeometry x="40" y="810" width="130" height="50" as="geometry" />
    </mxCell>
    <mxCell id="dbEvents" value="Insert strokes and sensor_events" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#9673a6;" vertex="1" parent="laneDb">
      <mxGeometry x="35" y="735" width="120" height="60" as="geometry" />
    </mxCell>
    <mxCell id="ai1" value="Generate simple feedback rules" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d79b00;" vertex="1" parent="laneAi">
      <mxGeometry x="35" y="735" width="120" height="60" as="geometry" />
    </mxCell>
    <mxCell id="dbFeedback" value="Persist ai_feedback" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#9673a6;" vertex="1" parent="laneDb">
      <mxGeometry x="35" y="815" width="120" height="45" as="geometry" />
    </mxCell>
    <mxCell id="screenCanvas" value="Render live canvas" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6c8ebf;" vertex="1" parent="laneScreen">
      <mxGeometry x="35" y="810" width="120" height="50" as="geometry" />
    </mxCell>

    <mxCell id="e1" value="REST" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="t2" target="s1">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e2" value="upsert" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="s1" target="db1">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e3" value="session_code" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="s1" target="t3">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e4" value="Socket.io" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="p2" target="srvScreen">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e5" value="REST join" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="st2" target="srvJoin">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e6" value="upsert" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="srvJoin" target="dbStudent">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e7" value="yes" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="condCode" target="stErr">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e8" value="REST control" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="tStart" target="srvControl">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e9" value="upsert" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="srvControl" target="dbSessionUpdate">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e9b" value="end creates next session" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="tStart" target="tNewSession">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e9c" value="POST /session/create" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="tNewSession" target="s1">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e10" value="broadcast state" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="srvState" target="screenCanvas">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e11" value="draw / sensor" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="stDraw" target="condActive">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e12" value="yes" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="condActive" target="srvDraw">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e13" value="persist event" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="srvDraw" target="dbEvents">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e14" value="evaluate shake / sequence" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="srvDraw" target="ai1">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e15" value="feedback row" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="ai1" target="dbFeedback">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="e16" value="canvas-broadcast" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="srvDraw" target="screenCanvas">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
  </root>
</mxGraphModel>
```
