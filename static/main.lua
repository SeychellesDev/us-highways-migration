-- lua55 .\us-highways-migration\static\main.lua
-- osrm-customize .\osrm\us-highways-only.osrm
-- osrm-routed --algorithm mld .\osrm\us-highways-only.osrm

api_version = 4

local file = io.open("./us-highways-migration/static/completed.json", "r")
local active_roads = {}
if file then
    local content = file:read("*a")
    file:close()
    -- Matches every string inside double quotes and maps it to true
    for road in string.gmatch(content, '"([^"]+)"') do
        active_roads[road] = true
    end
end

function setup()
    return {
        properties = {
            weight_name = 'duration',
            process_call_tagless_node = false,
            u_turn_penalty = 20
        },
        modes = {
            driving = true
        },
        default_speeds = default_speeds
    }
end

math.randomseed(os.time())

local BOOSTED_SPEED = 200
local default_speeds = {
    motorway = 90, trunk = 80, primary = 65, secondary = 55, 
    tertiary = 40, unclassified = 30, residential = 25, service = 15
}

function process_way(profile, way, result)
    local highway = way:get_value_by_key("highway")
    local ref = way:get_value_by_key("ref")
    local name = way:get_value_by_key("name")
    
    if not highway or not default_speeds[highway] then return end
    local speed = default_speeds[highway]
    
    -- 2. Check if this specific road segment belongs to ANY highway in your JSON list
    local is_target = false
    if (ref and active_roads[ref]) or (name and active_roads[name]) then
        is_target = true
    end

    if is_target then
        result.forward_speed = BOOSTED_SPEED
        result.backward_speed = BOOSTED_SPEED
        result.forward_rate = 1.0
        result.backward_rate = 1.0
    else
        local slow_speed = math.max(5, speed * 0.1)
        result.forward_speed = slow_speed
        result.backward_speed = slow_speed
        result.forward_rate = 0.1
        result.backward_rate = 0.1
    end
    
    local onway = way:get_value_by_key("oneway")
    if onway == 'yes' or onway == '1' or onway == 'true' then
        result.forward_mode = mode.driving
        result.backward_mode = mode.inaccessible
    elseif onway == '-1' then
        result.forward_mode = mode.inaccessible
        result.backward_mode = mode.driving
    else
        result.forward_mode = mode.driving
        result.backward_mode = mode.driving
    end
end

return {
    setup = setup,
    process_way = process_way
}