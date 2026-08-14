-- lua55 .\us-highways-migration\static\main.lua

api_version = 4

function set_manifest()
    return {
        config = {
            name = "Get Full Route",
            speed_reduction = 0.8
        }
    }
end

math.randomseed(os.time())

local function get_random_road_from_json()
    local file = io.open("./us-highways-migration/static/completed.json", "r")
    if not file then
        return nil
    end
    local content = file:read("*a")
    file:close()
    local roads = {}
    for road in string.gmatch(content, '"([^"]+)"') do
        table.insert(roads, road)
    end
    if #roads == 0 then
        return nil
    end
    local random_index = math.random(1, #roads)
    return roads[random_index]
end

local cli_arg = (arg and arg[1]) or nil
local TARGET_REF = os.getenv("TARGET_REF") or get_random_road_from_json("roads.json") or cli_arg or "NJ Monmouth 2"
print("Selected target road profile for " .. TARGET_REF)

local BOOSTED_SPEED = 200
local default_speeds = {
    motorway = 90,
    trunk = 80,
    primary = 65,
    secondary = 55,
    tertiary = 40,
    unclassified = 30,
    residential = 25,
    service = 15
}

function process_way(profile, way, result)
    local highway = way:get_value_by_key("highway")
    local ref = way:get_value_by_key("ref")
    local name = way:get_value_by_key("name")
    if not highway or not default_speeds[highway] then
        return
    end
    local speed = default_speeds[highway]
    local is_target = false
    if ref and string.find(ref, TARGET_REF) then
        is_target = true
    elseif name and string.find(name, TARGET_REF) then
        is_target = true
    end
    if is_target then
        result.forward_speed = BOOSTED_SPEED
        result.backward_speed = BOOSTED_SPEED
        result.priority = 1.0
    else
        result.forward_speed = math.max(5, speed * 0.1)
        result.backward_speed = math.max(5, speed * 0.1)
        result.priority = 0.1
    end
    local oneway = way:get_value_by_key("oneway")
    if oneway == 'yes' or oneway == '1' or oneway == 'true' then
        result.forward_mode = mode.driving
        result.backward_mode = mode.inaccessible
    elseif oneway == '-1' then
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